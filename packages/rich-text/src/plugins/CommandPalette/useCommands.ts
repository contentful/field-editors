import { useState } from 'react';

import { FieldExtensionSDK } from '@contentful/app-sdk';
import { entityHelpers } from '@contentful/field-editor-shared';

interface Command {
  label: string;
  callback: () => void;
}

interface CommandGroup {
  group: string;
  commands: Command[];
}

type CommandList = (Command | CommandGroup)[];

//todo clear text on callback
export const useCommands = (sdk: FieldExtensionSDK, query: string) => {
  const contentTypes = sdk.space.getCachedContentTypes();

  async function fetchEntries(contentType, query = '') {
    const entries = await sdk.space.getEntries({
      content_type: contentType.sys.id,
      query,
    });

    return entries.items.map((entry) => {
      const description = entityHelpers.getEntityDescription({
        contentType,
        // @ts-expect-error inconsistent in typing between app-sdk & field-editors-shared
        entity: entry,
        localeCode: sdk.field.locale,
        defaultLocaleCode: sdk.locales.default,
      });

      const displayTitle = entityHelpers.getEntryTitle({
        // @ts-expect-error inconsistent in typing between app-sdk & field-editors-shared
        entry,
        contentType,
        localeCode: sdk.field.locale,
        defaultLocaleCode: sdk.locales.default,
        defaultTitle: 'Untitled',
      });

      return {
        contentTypeName: contentType.name,
        displayTitle: displayTitle,
        id: entry.sys.contentType.sys.id,
        description,
        entry,
      };
    });
  }

  async function fetchAssets(query = '') {
    const assets = await sdk.space.getAssets({ query });
    return assets.items.map((asset) => ({
      contentTypeName: 'Asset',
      displayTitle: asset.fields.title ? asset.fields.title[sdk.field.locale] : 'Untitled',
      id: asset.sys.id,
      entry: asset,
      thumbnail:
        asset.fields.file &&
        asset.fields.file[sdk.field.locale] &&
        `${asset.fields.file[sdk.field.locale].url}?h=30`,
    }));
  }

  const [commands, setCommands] = useState((): CommandList => {
    const contentTypeCommands = contentTypes.map((contentType) => {
      return {
        group: contentType.name,
        commands: [
          {
            label: `Embed ${contentType.name}`,
            callback: () => {
              fetchEntries(contentType).then((entries) => {
                setCommands(
                  entries.map((entry) => {
                    return {
                      label: entry.displayTitle,
                      callback: () => console.log(entry.displayTitle),
                    };
                  })
                );
              });
            },
          },
          {
            label: `Embed ${contentType.name} - Inline`,
            callback: () => {
              fetchEntries(contentType).then((entries) => {
                setCommands(
                  entries.map((entry) => {
                    return {
                      label: entry.displayTitle,
                      callback: () => console.log(entry.displayTitle, 'Inline'),
                    };
                  })
                );
              });
            },
          },
        ],
      };
    });
    const assetCommand = {
      group: 'Assets',
      commands: [
        {
          label: 'Embed Asset',
          callback: () => {
            fetchAssets().then((assets) => {
              setCommands(
                assets.map((asset) => {
                  return {
                    label: asset.displayTitle,
                    callback: () => console.log(asset.displayTitle),
                  };
                })
              );
            });
          },
        },
      ],
    };
    return [...contentTypeCommands, assetCommand];
  });

  return query
    ? commands.reduce((list, nextItem) => {
        if ('group' in nextItem) {
          const subcommands = nextItem.commands.filter((command) => {
            return command.label.toLowerCase().includes(query.toLowerCase());
          });
          if (subcommands.length > 0) {
            list.push(nextItem);
          }
        } else {
          if (nextItem.label.toLowerCase().includes(query.toLowerCase())) {
            list.push(nextItem);
          }
        }
        return list;
      }, [] as CommandList)
    : commands;
};
