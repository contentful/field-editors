import { useMemo, useState } from 'react';

import type { FieldAppSDK } from '@contentful/app-sdk';
import { useContentTypes } from '@contentful/field-editor-shared/react-query';
import { BLOCKS, INLINES } from '@contentful/rich-text-types';

import { isNodeTypeSelected } from '../../helpers/editor';
import { isNodeTypeEnabled } from '../../helpers/validations';
import { getRange, getAboveNode } from '../../internal/queries';
import { select, insertNodes, deleteText, removeMark } from '../../internal/transforms';
import { PlateEditor } from '../../internal/types';
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
  asset?: boolean;
}

export interface CommandGroup {
  group: string;
  commands: Command[];
}

export type CommandList = (Command | CommandGroup)[];

const removeCommand = (editor: PlateEditor) => {
  const [, path] = getAboveNode(editor)!;
  const range = getRange(editor, path);

  select(editor, range.focus.path);

  removeMark(editor, COMMAND_PROMPT, range);
  deleteText(editor);
};

const removeQuery = (editor: PlateEditor) => {
  const [, path] = getAboveNode(editor)!;
  const range = getRange(editor, path);

  if (range.focus.offset - range.anchor.offset > 1) {
    deleteText(editor, { at: range.focus, distance: range.focus.offset - 1, reverse: true });
  }
};

export function isCommandPromptPluginEnabled(sdk: FieldAppSDK) {
  const inlineAllowed = isNodeTypeEnabled(sdk.field, INLINES.EMBEDDED_ENTRY);
  const entriesAllowed = isNodeTypeEnabled(sdk.field, BLOCKS.EMBEDDED_ENTRY);
  const assetsAllowed = isNodeTypeEnabled(sdk.field, BLOCKS.EMBEDDED_ASSET);

  return {
    inlineAllowed,
    entriesAllowed,
    assetsAllowed,
  };
}

function getCommandPermissions(sdk: FieldAppSDK, editor: PlateEditor) {
  const canInsertBlocks = !isNodeTypeSelected(editor, BLOCKS.TABLE);
  const { inlineAllowed, entriesAllowed, assetsAllowed } = isCommandPromptPluginEnabled(sdk);

  return {
    inlineAllowed,
    entriesAllowed: entriesAllowed && canInsertBlocks,
    assetsAllowed: assetsAllowed && canInsertBlocks,
  };
}

const getAllowedContentTypesFromValidation = (validations) => {
  const types = [BLOCKS.EMBEDDED_ENTRY, INLINES.EMBEDDED_ENTRY];

  return validations.reduce((acc, validation) => {
    types.forEach((type) => {
      const linkContentTypes = validation.nodes?.[type]?.[0]?.linkContentType;
      if (linkContentTypes) {
        if (!acc[type]) {
          acc[type] = {};
        }

        linkContentTypes.forEach((contentType) => {
          acc[type][contentType] = true;
        });
      }
    });
    return acc;
  }, {});
};

export const useCommands = (sdk: FieldAppSDK, query: string, editor: PlateEditor) => {
  const { contentTypes } = useContentTypes(sdk);
  const { inlineAllowed, entriesAllowed, assetsAllowed } = getCommandPermissions(sdk, editor);
  const allowedContentTypesFromValidation = getAllowedContentTypesFromValidation(
    sdk.field.validations,
  );

  const filterContentTypesByValidation = (type) =>
    contentTypes.filter(
      (contentType) => allowedContentTypesFromValidation[type]?.[contentType.sys.id],
    );

  const filteredBlockContentTypes = filterContentTypesByValidation(BLOCKS.EMBEDDED_ENTRY);
  const filteredInlineContentTypes = filterContentTypesByValidation(INLINES.EMBEDDED_ENTRY);

  const getContentTypeToUse = (allowed, isFiltered, filteredTypes) =>
    allowed ? (isFiltered ? filteredTypes : contentTypes) : [];

  const blockContentTypesToUse = getContentTypeToUse(
    entriesAllowed,
    filteredBlockContentTypes.length > 0,
    filteredBlockContentTypes,
  );
  const inlineContentTypesToUse = getContentTypeToUse(
    inlineAllowed,
    filteredInlineContentTypes.length > 0,
    filteredInlineContentTypes,
  );

  const relevantContentTypes = contentTypes.filter(
    (ct) => blockContentTypesToUse.includes(ct) || inlineContentTypesToUse.includes(ct),
  );

  const [commands, setCommands] = useState<CommandList>([]);

  const initialCommands = useMemo((): CommandList => {
    const getEmbedEntry = (contentType) => {
      return {
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
                entries.map((ct) => {
                  return {
                    id: ct.entry.sys.id,
                    label: ct.displayTitle,
                    callback: () => {
                      removeCommand(editor);
                      if (editor.selection) {
                        const selection = editor.selection;
                        editor.insertSoftBreak();
                        insertBlock(editor, BLOCKS.EMBEDDED_ENTRY, ct.entry);
                        select(editor, selection);
                        editor.tracking.onCommandPaletteAction('insert', {
                          nodeType: BLOCKS.EMBEDDED_ENTRY,
                        });
                      }
                    },
                  };
                }),
              );
            }
          });
        },
      };
    };

    const getEmbedInline = (contentType) => {
      return {
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
                entries.map((ct) => {
                  return {
                    id: ct.entry.sys.id,
                    label: ct.displayTitle,
                    callback: () => {
                      const inlineNode = createInlineEntryNode(ct.entry.sys.id);
                      removeCommand(editor);
                      insertNodes(editor, inlineNode);
                      editor.insertText('');
                      editor.tracking.onCommandPaletteAction('insert', {
                        nodeType: INLINES.EMBEDDED_ENTRY,
                      });
                    },
                  };
                }),
              );
            }
          });
        },
      };
    };

    const contentTypeCommands =
      entriesAllowed || inlineAllowed
        ? relevantContentTypes.map((contentType) => {
            const blockEmbedAllowed = blockContentTypesToUse.some(
              (ct) => ct.sys.id === contentType.sys.id,
            );
            const inlineEmbedAllowed = inlineContentTypesToUse.some(
              (ct) => ct.sys.id === contentType.sys.id,
            );

            const commands: Command[] = [];
            if (entriesAllowed && blockEmbedAllowed) {
              commands.push(getEmbedEntry(contentType));
            }
            if (inlineAllowed && inlineEmbedAllowed) {
              commands.push(getEmbedInline(contentType));
            }

            return {
              group: contentType.name,
              commands: commands,
            };
          })
        : [];

    if (assetsAllowed) {
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
                        id: asset.entity.sys.id,
                        label: asset.displayTitle,
                        thumbnail: asset.thumbnail,
                        asset: true,
                        callback: () => {
                          removeCommand(editor);
                          if (editor.selection) {
                            const selection = editor.selection;
                            editor.insertSoftBreak();
                            insertBlock(editor, BLOCKS.EMBEDDED_ASSET, asset.entity);
                            select(editor, selection);
                            editor.tracking.onCommandPaletteAction('insert', {
                              nodeType: BLOCKS.EMBEDDED_ASSET,
                            });
                          }
                        },
                      };
                    }),
                  );
                }
              });
            },
          },
        ],
      };
      return [...contentTypeCommands, assetCommand];
    }

    return contentTypeCommands;
  }, [
    relevantContentTypes,
    entriesAllowed,
    inlineAllowed,
    assetsAllowed,
    blockContentTypesToUse,
    inlineContentTypesToUse,
    sdk,
    editor,
    query,
  ]);

  /* filter both commands and groups of commands with the user typed query */
  const displayCommands = commands.length > 0 ? commands : initialCommands;

  return query
    ? displayCommands.reduce((list, nextItem) => {
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
    : displayCommands;
};
