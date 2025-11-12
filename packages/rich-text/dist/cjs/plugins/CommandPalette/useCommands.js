"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    isCommandPromptPluginEnabled: function() {
        return isCommandPromptPluginEnabled;
    },
    useCommands: function() {
        return useCommands;
    }
});
const _react = require("react");
const _richtexttypes = require("@contentful/rich-text-types");
const _editor = require("../../helpers/editor");
const _validations = require("../../helpers/validations");
const _queries = require("../../internal/queries");
const _transforms = require("../../internal/transforms");
const _constants = require("./constants");
const _createInlineEntryNode = require("./utils/createInlineEntryNode");
const _fetchAssets = require("./utils/fetchAssets");
const _fetchEntries = require("./utils/fetchEntries");
const _insertBlock = require("./utils/insertBlock");
const removeCommand = (editor)=>{
    const [, path] = (0, _queries.getAboveNode)(editor);
    const range = (0, _queries.getRange)(editor, path);
    (0, _transforms.select)(editor, range.focus.path);
    (0, _transforms.removeMark)(editor, _constants.COMMAND_PROMPT, range);
    (0, _transforms.deleteText)(editor);
};
const removeQuery = (editor)=>{
    const [, path] = (0, _queries.getAboveNode)(editor);
    const range = (0, _queries.getRange)(editor, path);
    if (range.focus.offset - range.anchor.offset > 1) {
        (0, _transforms.deleteText)(editor, {
            at: range.focus,
            distance: range.focus.offset - 1,
            reverse: true
        });
    }
};
function isCommandPromptPluginEnabled(sdk) {
    const inlineAllowed = (0, _validations.isNodeTypeEnabled)(sdk.field, _richtexttypes.INLINES.EMBEDDED_ENTRY);
    const entriesAllowed = (0, _validations.isNodeTypeEnabled)(sdk.field, _richtexttypes.BLOCKS.EMBEDDED_ENTRY);
    const assetsAllowed = (0, _validations.isNodeTypeEnabled)(sdk.field, _richtexttypes.BLOCKS.EMBEDDED_ASSET);
    return {
        inlineAllowed,
        entriesAllowed,
        assetsAllowed
    };
}
function getCommandPermissions(sdk, editor) {
    const canInsertBlocks = !(0, _editor.isNodeTypeSelected)(editor, _richtexttypes.BLOCKS.TABLE);
    const { inlineAllowed, entriesAllowed, assetsAllowed } = isCommandPromptPluginEnabled(sdk);
    return {
        inlineAllowed,
        entriesAllowed: entriesAllowed && canInsertBlocks,
        assetsAllowed: assetsAllowed && canInsertBlocks
    };
}
const getAllowedContentTypesFromValidation = (validations)=>{
    const types = [
        _richtexttypes.BLOCKS.EMBEDDED_ENTRY,
        _richtexttypes.INLINES.EMBEDDED_ENTRY
    ];
    return validations.reduce((acc, validation)=>{
        types.forEach((type)=>{
            const linkContentTypes = validation.nodes?.[type]?.[0]?.linkContentType;
            if (linkContentTypes) {
                if (!acc[type]) {
                    acc[type] = {};
                }
                linkContentTypes.forEach((contentType)=>{
                    acc[type][contentType] = true;
                });
            }
        });
        return acc;
    }, {});
};
const useCommands = (sdk, query, editor)=>{
    const contentTypes = sdk.space.getCachedContentTypes();
    const { inlineAllowed, entriesAllowed, assetsAllowed } = getCommandPermissions(sdk, editor);
    const allowedContentTypesFromValidation = getAllowedContentTypesFromValidation(sdk.field.validations);
    const filterContentTypesByValidation = (type)=>contentTypes.filter((contentType)=>allowedContentTypesFromValidation[type]?.[contentType.sys.id]);
    const filteredBlockContentTypes = filterContentTypesByValidation(_richtexttypes.BLOCKS.EMBEDDED_ENTRY);
    const filteredInlineContentTypes = filterContentTypesByValidation(_richtexttypes.INLINES.EMBEDDED_ENTRY);
    const getContentTypeToUse = (allowed, isFiltered, filteredTypes)=>allowed ? isFiltered ? filteredTypes : contentTypes : [];
    const blockContentTypesToUse = getContentTypeToUse(entriesAllowed, filteredBlockContentTypes.length > 0, filteredBlockContentTypes);
    const inlineContentTypesToUse = getContentTypeToUse(inlineAllowed, filteredInlineContentTypes.length > 0, filteredInlineContentTypes);
    const relevantContentTypes = contentTypes.filter((ct)=>blockContentTypesToUse.includes(ct) || inlineContentTypesToUse.includes(ct));
    const [commands, setCommands] = (0, _react.useState)(()=>{
        const getEmbedEntry = (contentType)=>{
            return {
                id: contentType.sys.id,
                label: `Embed ${contentType.name}`,
                callback: ()=>{
                    (0, _fetchEntries.fetchEntries)(sdk, contentType, query).then((entries)=>{
                        removeQuery(editor);
                        if (!entries.length) {
                            setCommands([
                                {
                                    id: 'no-results',
                                    label: 'No results'
                                }
                            ]);
                        } else {
                            setCommands(entries.map((ct)=>{
                                return {
                                    id: ct.entry.sys.id,
                                    label: ct.displayTitle,
                                    callback: ()=>{
                                        removeCommand(editor);
                                        if (editor.selection) {
                                            const selection = editor.selection;
                                            editor.insertSoftBreak();
                                            (0, _insertBlock.insertBlock)(editor, _richtexttypes.BLOCKS.EMBEDDED_ENTRY, ct.entry);
                                            (0, _transforms.select)(editor, selection);
                                            editor.tracking.onCommandPaletteAction('insert', {
                                                nodeType: _richtexttypes.BLOCKS.EMBEDDED_ENTRY
                                            });
                                        }
                                    }
                                };
                            }));
                        }
                    });
                }
            };
        };
        const getEmbedInline = (contentType)=>{
            return {
                id: `${contentType.sys.id}-inline`,
                label: `Embed ${contentType.name} - Inline`,
                callback: ()=>{
                    (0, _fetchEntries.fetchEntries)(sdk, contentType, query).then((entries)=>{
                        removeQuery(editor);
                        if (!entries.length) {
                            setCommands([
                                {
                                    id: 'no-results',
                                    label: 'No results'
                                }
                            ]);
                        } else {
                            setCommands(entries.map((ct)=>{
                                return {
                                    id: ct.entry.sys.id,
                                    label: ct.displayTitle,
                                    callback: ()=>{
                                        const inlineNode = (0, _createInlineEntryNode.createInlineEntryNode)(ct.entry.sys.id);
                                        removeCommand(editor);
                                        (0, _transforms.insertNodes)(editor, inlineNode);
                                        editor.insertText('');
                                        editor.tracking.onCommandPaletteAction('insert', {
                                            nodeType: _richtexttypes.INLINES.EMBEDDED_ENTRY
                                        });
                                    }
                                };
                            }));
                        }
                    });
                }
            };
        };
        const contentTypeCommands = entriesAllowed || inlineAllowed ? relevantContentTypes.map((contentType)=>{
            const blockEmbedAllowed = blockContentTypesToUse.some((ct)=>ct.sys.id === contentType.sys.id);
            const inlineEmbedAllowed = inlineContentTypesToUse.some((ct)=>ct.sys.id === contentType.sys.id);
            const commands = [];
            if (entriesAllowed && blockEmbedAllowed) {
                commands.push(getEmbedEntry(contentType));
            }
            if (inlineAllowed && inlineEmbedAllowed) {
                commands.push(getEmbedInline(contentType));
            }
            return {
                group: contentType.name,
                commands: commands
            };
        }) : [];
        if (assetsAllowed) {
            const assetCommand = {
                group: 'Assets',
                commands: [
                    {
                        id: 'embed-asset',
                        label: 'Embed Asset',
                        callback: ()=>{
                            (0, _fetchAssets.fetchAssets)(sdk, query).then((assets)=>{
                                removeQuery(editor);
                                if (!assets.length) {
                                    setCommands([
                                        {
                                            id: 'no-results',
                                            label: 'No results'
                                        }
                                    ]);
                                } else {
                                    setCommands(assets.map((asset)=>{
                                        return {
                                            id: asset.entity.sys.id,
                                            label: asset.displayTitle,
                                            thumbnail: asset.thumbnail,
                                            asset: true,
                                            callback: ()=>{
                                                removeCommand(editor);
                                                if (editor.selection) {
                                                    const selection = editor.selection;
                                                    editor.insertSoftBreak();
                                                    (0, _insertBlock.insertBlock)(editor, _richtexttypes.BLOCKS.EMBEDDED_ASSET, asset.entity);
                                                    (0, _transforms.select)(editor, selection);
                                                    editor.tracking.onCommandPaletteAction('insert', {
                                                        nodeType: _richtexttypes.BLOCKS.EMBEDDED_ASSET
                                                    });
                                                }
                                            }
                                        };
                                    }));
                                }
                            });
                        }
                    }
                ]
            };
            return [
                ...contentTypeCommands,
                assetCommand
            ];
        }
        return contentTypeCommands;
    });
    return query ? commands.reduce((list, nextItem)=>{
        if ('group' in nextItem) {
            const subcommands = nextItem.commands.filter((command)=>{
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
    }, []) : commands;
};
