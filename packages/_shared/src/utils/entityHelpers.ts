import get from 'lodash/get';
import isObject from 'lodash/isObject';
import isString from 'lodash/isString';
import { File, ContentType, Entry, ContentTypeField, EntrySys } from '../typesEntity';

function titleOrDefault(title: string | undefined, defaultTitle: string): string {
  if (!isString(title)) {
    return defaultTitle;
  }
  if (title) {
    // check if title consist only from whitespace symbols
    if (typeof title.match === 'function' && title.match(/^\s*$/)) {
      return defaultTitle;
    }
    return title.trim();
  }
  return defaultTitle;
}

export function getFieldValue({
  /**
   * Expects an entity fetched with a flag Skip-Transformation: true
   */
  entity,
  fieldId,
  localeCode,
  defaultLocaleCode
}: {
  entity: {
    fields: { [key: string]: { [valueKey: string]: string | undefined } };
  };
  fieldId: string;
  localeCode: string;
  defaultLocaleCode: string;
}): string | undefined {
  const values = get(entity, ['fields', fieldId]);
  if (!isObject(values)) {
    return;
  }

  const firstLocaleCode = Object.keys(values)[0];

  return values[localeCode] || values[defaultLocaleCode] || values[firstLocaleCode];
}

export function getAssetTitle({
  asset,
  localeCode,
  defaultLocaleCode,
  defaultTitle
}: {
  asset: Entry;
  localeCode: string;
  defaultLocaleCode: string;
  defaultTitle: string;
}) {
  const title = getFieldValue({
    entity: asset,
    fieldId: 'title',
    localeCode,
    defaultLocaleCode
  });
  return titleOrDefault(title, defaultTitle);
}

export function getEntityDescription({
  entity,
  contentType,
  localeCode,
  defaultLocaleCode
}: {
  entity: Entry;
  contentType?: ContentType;
  localeCode: string;
  defaultLocaleCode: string;
}): string {
  if (!contentType) {
    return '';
  }

  const isTextField = (field: ContentTypeField) => ['Symbol', 'Text'].includes(field.type);
  const isDisplayField = (field: ContentTypeField) => field.id === contentType.displayField;
  const isMaybeSlugField = (field: ContentTypeField) => /\bslug\b/.test(field.name);
  const isDescriptionField = (field: ContentTypeField) =>
    isTextField(field) && !isDisplayField(field) && !isMaybeSlugField(field);

  const descriptionField = contentType.fields.find(isDescriptionField);

  if (!descriptionField) {
    return '';
  }

  return (
    getFieldValue({ entity, fieldId: descriptionField.id, localeCode, defaultLocaleCode }) || ''
  );
}

export function getEntryTitle({
  entry,
  contentType,
  localeCode,
  defaultLocaleCode,
  defaultTitle
}: {
  entry: Entry;
  contentType?: ContentType;
  localeCode: string;
  defaultLocaleCode: string;
  defaultTitle: string;
}) {
  let title;

  if (!contentType) {
    return defaultTitle;
  }

  const displayField = contentType.displayField;
  if (!displayField) {
    return defaultTitle;
  }

  const displayFieldInfo = contentType.fields.find(field => field.id === displayField);

  if (!displayFieldInfo) {
    return defaultTitle;
  }

  // when localization for a field is "turned off",
  // we don't clean up the "old" localized data, so it is still in the response.
  // Therefore, we're checking if displayField is localizable.
  if (displayFieldInfo.localized) {
    title = getFieldValue({
      entity: entry,
      fieldId: displayField,
      localeCode,
      defaultLocaleCode
    });
    if (!title) {
      // Older content types may return id/apiName, but some entry lookup paths do not fetch raw data
      // In order to still return a title in this case, look for displayField as apiName in content type,
      // ...but still look for displayField as a field in the entry
      title = getFieldValue({
        entity: entry,
        fieldId: displayFieldInfo.id,
        localeCode,
        defaultLocaleCode
      });
    }
  } else {
    title = getFieldValue({
      entity: entry,
      fieldId: displayField,
      defaultLocaleCode,
      localeCode: ''
    });
    if (!title) {
      title = getFieldValue({
        entity: entry,
        fieldId: displayFieldInfo.id,
        defaultLocaleCode,
        localeCode: ''
      });
    }
  }

  return titleOrDefault(title, defaultTitle);
}

export function getEntryStatus(sys: EntrySys) {
  if (!sys || (sys.type !== 'Entry' && sys.type !== 'Asset')) {
    throw new TypeError('Invalid entity metadata object');
  }
  if (sys.deletedVersion) {
    return 'deleted';
  } else if (sys.archivedVersion) {
    return 'archived';
  } else if (sys.publishedVersion) {
    if (sys.version > sys.publishedVersion + 1) {
      return 'changed';
    } else {
      return 'published';
    }
  } else {
    return 'draft';
  }
}

/**
 * Gets a promise resolving with a localized asset image field representing a
 * given entities file. The promise may resolve with null.
 */
export const getEntryImage = async (
  {
    entry,
    contentType,
    localeCode
  }: {
    entry: Entry;
    contentType?: ContentType;
    localeCode: string;
    defaultLocaleCode: string;
  },
  getAsset: (assetId: string) => Promise<unknown>
): Promise<null | File> => {
  if (!contentType) {
    return null;
  }

  const assetLink = contentType.fields.find(
    field => field.type === 'Link' && field.linkType === 'Asset'
  );

  if (!assetLink) {
    return null;
  }

  const assetId = get(entry.fields, [assetLink.id, localeCode, 'sys', 'id']);

  if (!assetId) {
    return null;
  }

  try {
    const asset = await getAsset(assetId);
    const file = get(asset, ['fields', 'file', localeCode]);
    const isImage = Boolean(get(file, ['details', 'image'], false));
    return isImage ? file : null;
  } catch (e) {
    return null;
  }
};
