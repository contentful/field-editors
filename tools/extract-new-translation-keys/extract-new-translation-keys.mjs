/* eslint-env node */
/* eslint-disable no-console */
import cma from 'contentful-management';
import { spawnSync } from 'node:child_process';
import { readFile, unlink } from 'node:fs/promises';
import PO from 'pofile';

const CATALOG_URL = 'https://i18n.contentful.com/api/catalogs/en-US?preview=true';
const USAGE = 'Usage: npm run upload-translation-keys <cma-token>';
const SPACE_ID = 'rykzha7r6s4b';
const ENVIRONMENT_ID = 'master';
const CONTENTFUL_URL = `https://app.contentful.com/spaces/${SPACE_ID}/environments/${ENVIRONMENT_ID}`;
const PLURAL_LANGUAGE_VALUE_ID_MAP = {
  '=0': 'languageValueZero',
  one: 'languageValueOne',
  two: 'languageValueTwo',
  few: 'languageValueFew',
  many: 'languageValueMany',
  other: 'languageValueOther',
};

const cmaToken = process.argv[2];

if (!cmaToken) {
  console.error('Error: <cma-token> parameter is missing');
  console.error(USAGE);
  process.exit(1);
}

const { catalogPath, sourceLocale } = await runCommand(readConfig, 'Reading the lingui config');

const catalog = await runCommand(() => getCatalog(catalogPath), 'Retrieving the local PO catalog');

await runCommand(() => sanitizeTranslations(catalog), 'Sanitizing translations');

const upstreamTranslationKeys = await runCommand(
  fetchUpstreamTranslationKeys,
  'Fetching upstream translation keys'
);

const newTranslations = await runCommand(
  () => extractNewTranslations(upstreamTranslationKeys, catalog),
  'Extracting new translations'
);

await uploadTranslations(newTranslations);

await runCommand(() => cleanUp(catalogPath), 'Cleaning up');

async function uploadTranslations(translations) {
  const client = cma.createClient({ accessToken: cmaToken }, { type: 'plain' });

  for (const poItem of translations) {
    const key = poItem.msgid;
    const description =
      poItem.extractedComments[0] !== 'js-lingui-explicit-id'
        ? poItem.extractedComments[0]
        : undefined;

    if (poItem.msgstr[0].match(/^\{(\w+),/)) {
      const fullMatch = poItem.msgstr[0].match(
        /^\{(\w+), plural,((?: (?:=\d+|\w+) \{(?:\{[^{]+?\}|[^{])*?\})+)\}$/
      );
      if (!fullMatch) {
        console.error(`Couldn't parse default message for key ${key}.`);
        continue;
      }

      const count = fullMatch[1];
      const rawForms = fullMatch[2];

      const formMatches = [...rawForms.matchAll(/ ((?:=\d+|\w+)) \{((?:\{[^{]+?\}|[^{])*?)\}/g)];
      const languageValues = Object.fromEntries(
        formMatches.map(([, key, message]) => [
          PLURAL_LANGUAGE_VALUE_ID_MAP[key],
          { [sourceLocale]: message },
        ])
      );

      const messageEntry = await createPluralMessageEntry(
        client,
        key,
        description,
        languageValues,
        count
      );
      await createTranslationEntry(client, key, messageEntry);
    } else {
      const messageEntry = await createMessageEntry(client, key, description, {
        'en-US': poItem.msgstr[0],
      });
      await createTranslationEntry(client, key, messageEntry);
    }
  }
}

async function runCommand(command, message) {
  try {
    process.stdout.write(`${message}...`);
    const result = await command();
    console.log(' DONE');
    return result;
  } catch (error) {
    console.error(`\nError: ${error}`);
    process.exit(1);
  }
}

async function fetchUpstreamTranslationKeys() {
  return await fetch(CATALOG_URL).then(async (response) => {
    if (!response.ok) {
      return Promise.reject(
        `Fetching catalog from ${CATALOG_URL} failed with ${response.status} ${response.statusText}`
      );
    }

    return new Set(Object.keys(await response.json()));
  });
}

async function extractNewTranslations(upstreamTranslationKeys, catalog) {
  const extractTranslationKeys = spawnSync('npm', ['run', 'extract-translation-keys']);
  if (extractTranslationKeys.status !== 0) {
    throw new Error(`Extracting keys failed with ${extractTranslationKeys.stderr.toString()}`);
  }

  return catalog.items.filter((item) => !upstreamTranslationKeys.has(item.msgid));
}

function readCatalog(path) {
  return new Promise((resolve, reject) => {
    PO.load(path, (err, po) => {
      if (err) {
        reject(err);
      } else {
        resolve(po);
      }
    });
  });
}

async function createMessageEntry(client, key, description, languageValue) {
  return await client.entry.create(
    {
      contentTypeId: 'message',
      spaceId: SPACE_ID,
      environmentId: ENVIRONMENT_ID,
    },
    {
      fields: {
        translationKey: { 'en-US': key },
        description: { 'en-US': description },
        languageValue,
      },
    }
  );
}

async function createPluralMessageEntry(client, key, description, languageValues, count) {
  return await client.entry.create(
    {
      contentTypeId: 'messageWithPluralization',
      spaceId: SPACE_ID,
      environmentId: ENVIRONMENT_ID,
    },
    {
      fields: {
        translationKey: { 'en-US': key },
        description: { 'en-US': description },
        count: { 'en-US': count },
        ...languageValues,
      },
    }
  );
}

async function createTranslationEntry(client, key, messageEntry) {
  let translationEntry;
  try {
    translationEntry = await client.entry.create(
      {
        contentTypeId: 'translation',
        spaceId: SPACE_ID,
        environmentId: ENVIRONMENT_ID,
      },
      {
        fields: {
          translationKey: { 'en-US': key },
          message: {
            'en-US': {
              sys: {
                type: 'Link',
                linkType: 'Entry',
                id: messageEntry.sys.id,
              },
            },
          },
        },
      }
    );
    await client.entry.publish(
      {
        spaceId: SPACE_ID,
        environmentId: ENVIRONMENT_ID,
        entryId: translationEntry.sys.id,
      },
      translationEntry
    );
    console.log(
      `Created entry ${CONTENTFUL_URL}/entries/${translationEntry.sys.id} for key ${key}.`
    );
  } catch (err) {
    try {
      if (translationEntry) {
        await client.entry.delete({
          spaceId: SPACE_ID,
          environmentId: ENVIRONMENT_ID,
          entryId: translationEntry.sys.id,
        });
      }
      await client.entry.delete({
        spaceId: SPACE_ID,
        environmentId: ENVIRONMENT_ID,
        entryId: messageEntry.sys.id,
      });
    } catch (err) {
      console.error(err);
    }

    if (
      err.name === 'InvalidEntry' &&
      err.message.includes('Same field value present in other entry')
    ) {
      console.error(`Entry for key ${key} already exists.`);
      return;
    }
    console.error(err);
  }
}

async function readConfig() {
  const config = await JSON.parse(await readFile('.linguirc', 'utf-8'));
  const { catalogs, sourceLocale } = config;

  if (catalogs.length > 1) {
    throw new Error(`One catalog expected, found ${catalogs.length}`);
  }
  const catalogPath = catalogs[0].path.replace('{locale}', `${sourceLocale}.po`);

  return { catalogPath, sourceLocale };
}

async function cleanUp(catalogPath) {
  return unlink(catalogPath);
}

function getCatalog(catalogPath) {
  const catalog = readCatalog(catalogPath);

  if (!catalog) {
    throw new Error(`Failed to read catalog at ${catalogPath}`);
  }

  return catalog;
}

/**
 * @description Sanitizes the extracted PO catalog's translation id/message pairs.
 * @throws If any `msgid` equals its `msgstr`.
 */
function sanitizeTranslations(catalog) {
  const invalidTranslations = [];

  catalog.items.forEach((item) => {
    const translationKey = item.msgid;
    const translationMessage = item.msgstr;

    translationMessage.forEach((message) => {
      if (translationKey === message) {
        invalidTranslations.push(translationKey);
      }
    });
  });

  if (invalidTranslations.length > 0) {
    const lines = invalidTranslations.map((invalidTranslation) => `- ${invalidTranslation}`);

    throw new Error(
      `Found ${invalidTranslations.length} invalid translations with identical key/message pairs which must be fixed:\n${lines.join('\n')}`
    );
  }
}
