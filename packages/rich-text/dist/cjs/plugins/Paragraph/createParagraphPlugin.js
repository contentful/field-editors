"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "createParagraphPlugin", {
    enumerable: true,
    get: function() {
        return createParagraphPlugin;
    }
});
const _richtexttypes = require("@contentful/rich-text-types");
const _plateparagraph = require("@udecode/plate-paragraph");
const _ishotkey = /*#__PURE__*/ _interop_require_default(require("is-hotkey"));
const _editor = require("../../helpers/editor");
const _transformers = require("../../helpers/transformers");
const _Paragraph = require("./Paragraph");
const _utils = require("./utils");
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
const buildParagraphKeyDownHandler = (editor, { options: { hotkey } })=>(event)=>{
        if (editor.selection && hotkey && (0, _ishotkey.default)(hotkey, event)) {
            (0, _editor.toggleElement)(editor, {
                activeType: _richtexttypes.BLOCKS.PARAGRAPH,
                inactiveType: _richtexttypes.BLOCKS.PARAGRAPH
            });
        }
    };
const createParagraphPlugin = ()=>{
    const config = {
        type: _richtexttypes.BLOCKS.PARAGRAPH,
        component: _Paragraph.Paragraph,
        options: {
            hotkey: [
                'mod+opt+0'
            ]
        },
        handlers: {
            onKeyDown: buildParagraphKeyDownHandler
        },
        softBreak: [
            {
                hotkey: 'shift+enter',
                query: {
                    allow: _richtexttypes.BLOCKS.PARAGRAPH
                }
            }
        ],
        deserializeHtml: {
            rules: [
                {
                    validNodeName: [
                        'P',
                        'DIV'
                    ]
                }
            ],
            query: (el)=>!(0, _utils.isEmptyElement)(el) && !(0, _utils.isEmbedElement)(el)
        },
        normalizer: [
            {
                validChildren: (_, [node])=>(0, _editor.isInlineOrText)(node),
                transform: {
                    [_richtexttypes.BLOCKS.PARAGRAPH]: _transformers.transformUnwrap,
                    default: _transformers.transformLift
                }
            }
        ]
    };
    return (0, _plateparagraph.createParagraphPlugin)(config);
};
