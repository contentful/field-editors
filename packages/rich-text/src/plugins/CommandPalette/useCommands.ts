import { useState } from 'react';

import { FieldExtensionSDK } from '@contentful/app-sdk';
import { BLOCKS } from '@contentful/rich-text-types';
import { getAbove, PlateEditor, removeMark } from '@udecode/plate-core';
import { Editor, Transforms } from 'slate';

import { COMMAND_PROMPT } from './constants';
import { createInlineEntryNode } from './utils/createInlineEntryNode';
import { fetchAssets } from './utils/fetchAssets';
import { fetchEntries } from './utils/fetchEntries';
import { insertBlock } from './utils/insertBlock';

export interface Command {
  id: string;
  thumbnail?: string;
  label: string;
  callback?: () => void;
}

export interface CommandGroup {
  group: string;
  commands: Command[];
}

export type CommandList = (Command | CommandGroup)[];

const removeCommand = (editor: PlateEditor) => {
  const [, path] = getAbove(editor)!;
  const range = Editor.range(editor, path);

  Transforms.select(editor, range.focus.path);

  removeMark(editor, { key: COMMAND_PROMPT, at: range });
  Transforms.delete(editor);
};

const removeQuery = (editor: PlateEditor) => {
  const [, path] = getAbove(editor)!;
  const range = Editor.range(editor, path);

  if (range.focus.offset - range.anchor.offset > 1) {
    Transforms.delete(editor, { at: range.focus, distance: range.focus.offset - 1, reverse: true });
  }
};

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
                removeQuery(editor);
                if (!entries.length) {
                  setCommands([
                    {
                      id: 'no-results',
                      label: 'No results',
                    },
                  ]);
                } else {
                  setCommands(
                    entries.map((entry) => {
                      return {
                        id: `${entry.id}-${entry.displayTitle.replace(/\W+/g, '-').toLowerCase()}`,
                        label: entry.displayTitle,
                        callback: () => {
                          removeCommand(editor);
                          if (editor.selection) {
                            const selection = editor.selection;
                            editor.insertSoftBreak();
                            insertBlock(editor, BLOCKS.EMBEDDED_ENTRY, entry.entry);
                            Transforms.select(editor, selection);
                          }
                        },
                      };
                    })
                  );
                }
              });
            },
          },
          {
            id: `${contentType.sys.id}-inline`,
            label: `Embed ${contentType.name} - Inline`,
            callback: () => {
              fetchEntries(sdk, contentType, query).then((entries) => {
                removeQuery(editor);
                if (!entries.length) {
                  setCommands([
                    {
                      id: 'no-results',
                      label: 'No results',
                    },
                  ]);
                } else {
                  setCommands(
                    entries.map((entry) => {
                      return {
                        id: `${entry.id}-${entry.displayTitle.replace(/\W+/g, '-').toLowerCase()}`,
                        label: entry.displayTitle,
                        callback: () => {
                          const inlineNode = createInlineEntryNode(entry.id);
                          removeCommand(editor);
                          Transforms.insertNodes(editor, inlineNode);
                          editor.insertText('');
                        },
                      };
                    })
                  );
                }
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
              removeQuery(editor);
              if (!assets.length) {
                setCommands([
                  {
                    id: 'no-results',
                    label: 'No results',
                  },
                ]);
              } else {
                setCommands(
                  assets.map((asset) => {
                    return {
                      id: `${asset.id}-${asset.displayTitle.replace(/\W+/g, '-').toLowerCase()}`,
                      label: asset.displayTitle,
                      thumbnail: asset.thumbnail,
                      callback: () => {
                        removeCommand(editor);
                        if (editor.selection) {
                          const selection = editor.selection;
                          editor.insertSoftBreak();
                          insertBlock(editor, BLOCKS.EMBEDDED_ASSET, asset.entity);
                          Transforms.select(editor, selection);
                        }
                      },
                    };
                  })
                );
              }
            });
          },
        },
      ],
    };
    return [...contentTypeCommands, assetCommand];
  });

  /* filter both commands and groups of commands with the user typed query */
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
