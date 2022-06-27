import { useState } from 'react';

import { FieldExtensionSDK } from '@contentful/app-sdk';

import { fetchAssets } from './utils/fetchAssets';
import { fetchEntries } from './utils/fetchEntries';

interface Command {
  id: string;
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

  const [commands, setCommands] = useState((): CommandList => {
    const contentTypeCommands = contentTypes.map((contentType) => {
      return {
        group: contentType.name,
        commands: [
          {
            id: contentType.sys.id,
            label: `Embed ${contentType.name}`,
            callback: () => {
              fetchEntries(sdk, contentType, query).then((entries) => {
                setCommands(
                  entries.map((entry) => {
                    return {
                      id: entry.id,
                      label: entry.displayTitle,
                      callback: () => console.log(entry.displayTitle),
                    };
                  })
                );
              });
            },
          },
          {
            id: `${contentType.sys.id}-inline`,
            label: `Embed ${contentType.name} - Inline`,
            callback: () => {
              fetchEntries(sdk, contentType, query).then((entries) => {
                setCommands(
                  entries.map((entry) => {
                    return {
                      id: entry.id,
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
          id: 'embed-asset',
          label: 'Embed Asset',
          callback: () => {
            fetchAssets(sdk, query).then((assets) => {
              setCommands(
                assets.map((asset) => {
                  return {
                    id: asset.id,
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
