import { useState } from 'react';

import { FieldExtensionSDK } from '@contentful/app-sdk';
import { BLOCKS } from '@contentful/rich-text-types';
import { getAbove, PlateEditor, removeMark } from '@udecode/plate-core';
import { insertBlock } from 'plugins/EmbeddedEntityBlock/Util';
import { Editor, Transforms } from 'slate';

import { createInlineEntryNode } from '../EmbeddedEntityInline/Util';
import { COMMAND_PROMPT } from './constants';
import { fetchAssets } from './utils/fetchAssets';
import { fetchEntries } from './utils/fetchEntries';

interface Command {
  id: string;
  thumbnail?: string;
  label: string;
  callback: () => void;
}

interface CommandGroup {
  group: string;
  commands: Command[];
}

type CommandList = (Command | CommandGroup)[];

const removeCommand = (editor: PlateEditor) => {
  const [, path] = getAbove(editor)!;
  const range = Editor.range(editor, path);
  editor.deleteFragment();
  removeMark(editor, { key: COMMAND_PROMPT, at: range });
};

//todo clear text on callback
export const useCommands = (sdk: FieldExtensionSDK, query: string, editor: PlateEditor) => {
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
                      id: `${entry.id}-${entry.displayTitle.replace(/\W+/g, '-').toLowerCase()}`,
                      label: entry.displayTitle,
                      callback: () => {
                        // insertBlock(editor, BLOCKS.EMBEDDED_ENTRY, entry);
                        removeCommand(editor);
                      },
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
                      id: `${entry.id}-${entry.displayTitle.replace(/\W+/g, '-').toLowerCase()}`,
                      label: entry.displayTitle,
                      callback: () => {
                        const inlineNode = createInlineEntryNode(entry.id);
                        Transforms.insertNodes(editor, inlineNode);
                        removeCommand(editor);
                      },
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
                    id: `${asset.id}-${asset.displayTitle.replace(/\W+/g, '-').toLowerCase()}`,
                    label: asset.displayTitle,
                    thumbnail: asset.thumbnail,
                    callback: () => {
                      // insertBlock(editor, BLOCKS.EMBEDDED_ASSET, asset);
                      removeCommand(editor);
                    },
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
