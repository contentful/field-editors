"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "createHeadingPlugin", {
    enumerable: true,
    get: function() {
        return createHeadingPlugin;
    }
});
const _richtexttypes = require("@contentful/rich-text-types");
const _ishotkey = /*#__PURE__*/ _interop_require_default(require("is-hotkey"));
const _editor = require("../../helpers/editor");
const _transformers = require("../../helpers/transformers");
const _queries = require("../../internal/queries");
const _constants = require("../CommandPalette/constants");
const _Heading = require("./components/Heading");
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
const buildHeadingEventHandler = (type)=>(editor, { options: { hotkey } })=>(event)=>{
            if (editor.selection && hotkey && (0, _ishotkey.default)(hotkey, event)) {
                if (type !== _richtexttypes.BLOCKS.PARAGRAPH) {
                    const isActive = (0, _editor.isBlockSelected)(editor, type);
                    editor.tracking.onShortcutAction(isActive ? 'remove' : 'insert', {
                        nodeType: type
                    });
                }
                (0, _editor.toggleElement)(editor, {
                    activeType: type,
                    inactiveType: _richtexttypes.BLOCKS.PARAGRAPH
                });
            }
        };
const createHeadingPlugin = ()=>({
        key: 'HeadingPlugin',
        softBreak: [
            {
                hotkey: 'shift+enter',
                query: {
                    allow: _richtexttypes.HEADINGS
                }
            }
        ],
        normalizer: [
            {
                match: {
                    type: _richtexttypes.HEADINGS
                },
                validChildren: (_, [node])=>(0, _editor.isInlineOrText)(node),
                transform: {
                    [_richtexttypes.BLOCKS.PARAGRAPH]: _transformers.transformUnwrap,
                    default: _transformers.transformLift
                }
            }
        ],
        then: (editor)=>{
            return {
                exitBreak: [
                    {
                        hotkey: 'enter',
                        query: {
                            allow: _richtexttypes.HEADINGS,
                            end: true,
                            start: true,
                            filter: ([, path])=>!(0, _queries.getAboveNode)(editor, {
                                    at: path,
                                    match: {
                                        type: _richtexttypes.BLOCKS.LIST_ITEM
                                    }
                                }) && !(0, _queries.isMarkActive)(editor, _constants.COMMAND_PROMPT)
                        }
                    }
                ]
            };
        },
        plugins: _richtexttypes.HEADINGS.map((nodeType, idx)=>{
            const level = idx + 1;
            const tagName = `h${level}`;
            return {
                key: nodeType,
                type: nodeType,
                isElement: true,
                component: _Heading.HeadingComponents[nodeType],
                options: {
                    hotkey: [
                        `mod+alt+${level}`
                    ]
                },
                handlers: {
                    onKeyDown: buildHeadingEventHandler(nodeType)
                },
                deserializeHtml: {
                    rules: [
                        {
                            validNodeName: tagName.toUpperCase()
                        }
                    ]
                }
            };
        })
    });
