"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function() {
        return _default;
    }
});
const _react = /*#__PURE__*/ _interop_require_wildcard(require("react"));
const _f36components = require("@contentful/f36-components");
const _f36icons = require("@contentful/f36-icons");
const _f36tokens = /*#__PURE__*/ _interop_require_default(require("@contentful/f36-tokens"));
const _richtexttypes = require("@contentful/rich-text-types");
const _emotion = require("emotion");
const _ContentfulEditorProvider = require("../ContentfulEditorProvider");
const _editor = require("../helpers/editor");
const _validations = require("../helpers/validations");
const _queries = require("../internal/queries");
const _Alignment = require("../plugins/Alignment");
const _Heading = require("../plugins/Heading");
const _Hr = require("../plugins/Hr");
const _Hyperlink = require("../plugins/Hyperlink");
const _List = require("../plugins/List");
const _Bold = require("../plugins/Marks/Bold");
const _Code = require("../plugins/Marks/Code");
const _Italic = require("../plugins/Marks/Italic");
const _Strikethrough = require("../plugins/Marks/Strikethrough");
const _Subscript = require("../plugins/Marks/Subscript");
const _Superscript = require("../plugins/Marks/Superscript");
const _Underline = require("../plugins/Marks/Underline");
const _Quote = require("../plugins/Quote");
const _Table = require("../plugins/Table");
const _SdkProvider = require("../SdkProvider");
const _ButtonRedo = require("./components/ButtonRedo");
const _ButtonUndo = require("./components/ButtonUndo");
const _EmbedEntityWidget = require("./components/EmbedEntityWidget");
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
function _getRequireWildcardCache(nodeInterop) {
    if (typeof WeakMap !== "function") return null;
    var cacheBabelInterop = new WeakMap();
    var cacheNodeInterop = new WeakMap();
    return (_getRequireWildcardCache = function(nodeInterop) {
        return nodeInterop ? cacheNodeInterop : cacheBabelInterop;
    })(nodeInterop);
}
function _interop_require_wildcard(obj, nodeInterop) {
    if (!nodeInterop && obj && obj.__esModule) {
        return obj;
    }
    if (obj === null || typeof obj !== "object" && typeof obj !== "function") {
        return {
            default: obj
        };
    }
    var cache = _getRequireWildcardCache(nodeInterop);
    if (cache && cache.has(obj)) {
        return cache.get(obj);
    }
    var newObj = {
        __proto__: null
    };
    var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor;
    for(var key in obj){
        if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) {
            var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null;
            if (desc && (desc.get || desc.set)) {
                Object.defineProperty(newObj, key, desc);
            } else {
                newObj[key] = obj[key];
            }
        }
    }
    newObj.default = obj;
    if (cache) {
        cache.set(obj, newObj);
    }
    return newObj;
}
const styles = {
    toolbar: (0, _emotion.css)({
        border: `1px solid ${_f36tokens.default.gray400}`,
        backgroundColor: _f36tokens.default.gray100,
        padding: _f36tokens.default.spacingXs,
        borderRadius: `${_f36tokens.default.borderRadiusMedium} ${_f36tokens.default.borderRadiusMedium} 0 0`
    }),
    toolbarBtn: (0, _emotion.css)({
        height: '30px',
        width: '30px',
        marginLeft: _f36tokens.default.spacing2Xs,
        marginRight: _f36tokens.default.spacing2Xs
    }),
    divider: (0, _emotion.css)({
        display: 'inline-block',
        height: '21px',
        width: '1px',
        background: _f36tokens.default.gray300,
        margin: `0 ${_f36tokens.default.spacing2Xs}`
    }),
    embedActionsWrapper: (0, _emotion.css)({
        display: [
            '-webkit-box',
            '-ms-flexbox',
            'flex'
        ],
        webkitAlignSelf: 'flex-start',
        alignSelf: 'flex-start',
        msFlexItemAlign: 'start'
    }),
    formattingOptionsWrapper: (0, _emotion.css)({
        display: [
            '-webkit-box',
            '-ms-flexbox',
            'flex'
        ],
        msFlexAlign: 'center',
        webkitBoxAlign: 'center',
        alignItems: 'center',
        msFlexWrap: 'wrap',
        flexWrap: 'wrap',
        marginRight: '20px'
    })
};
const dropdownMarks = [
    _richtexttypes.MARKS.SUPERSCRIPT,
    _richtexttypes.MARKS.SUBSCRIPT,
    _richtexttypes.MARKS.CODE,
    _richtexttypes.MARKS.STRIKETHROUGH
];
const Dropdown = ({ sdk, isDisabled })=>{
    const editor = (0, _ContentfulEditorProvider.useContentfulEditor)();
    const isActive = editor && dropdownMarks.some((mark)=>(0, _queries.isMarkActive)(editor, mark));
    return /*#__PURE__*/ _react.createElement(_f36components.Menu, null, /*#__PURE__*/ _react.createElement(_f36components.Menu.Trigger, null, /*#__PURE__*/ _react.createElement("span", null, /*#__PURE__*/ _react.createElement(_f36components.IconButton, {
        size: "small",
        className: styles.toolbarBtn,
        variant: isActive ? 'secondary' : 'transparent',
        icon: /*#__PURE__*/ _react.createElement(_f36icons.DotsThreeIcon, null),
        "aria-label": "toggle menu",
        isDisabled: isDisabled,
        testId: "dropdown-toolbar-button"
    }))), /*#__PURE__*/ _react.createElement(_f36components.Menu.List, null, (0, _validations.isMarkEnabled)(sdk.field, _richtexttypes.MARKS.SUPERSCRIPT) && /*#__PURE__*/ _react.createElement(_Superscript.ToolbarDropdownSuperscriptButton, {
        isDisabled: isDisabled
    }), (0, _validations.isMarkEnabled)(sdk.field, _richtexttypes.MARKS.SUBSCRIPT) && /*#__PURE__*/ _react.createElement(_Subscript.ToolbarDropdownSubscriptButton, {
        isDisabled: isDisabled
    }), (0, _validations.isMarkEnabled)(sdk.field, _richtexttypes.MARKS.STRIKETHROUGH) && /*#__PURE__*/ _react.createElement(_Strikethrough.ToolbarDropdownStrikethroughButton, {
        isDisabled: isDisabled
    }), (0, _validations.isMarkEnabled)(sdk.field, _richtexttypes.MARKS.CODE) && /*#__PURE__*/ _react.createElement(_Code.ToolbarDropdownCodeButton, {
        isDisabled: isDisabled
    })));
};
const Toolbar = ({ isDisabled })=>{
    const sdk = (0, _SdkProvider.useSdkContext)();
    const editor = (0, _ContentfulEditorProvider.useContentfulEditor)();
    const canInsertBlocks = !(0, _editor.isNodeTypeSelected)(editor, _richtexttypes.BLOCKS.TABLE);
    const validationInfo = _react.useMemo(()=>getValidationInfo(sdk.field), [
        sdk.field
    ]);
    const isListSelected = (0, _editor.isNodeTypeSelected)(editor, _richtexttypes.BLOCKS.UL_LIST) || (0, _editor.isNodeTypeSelected)(editor, _richtexttypes.BLOCKS.OL_LIST);
    const isBlockquoteSelected = (0, _editor.isNodeTypeSelected)(editor, _richtexttypes.BLOCKS.QUOTE);
    const shouldDisableTables = isDisabled || !canInsertBlocks || isListSelected || isBlockquoteSelected;
    const boldItalicUnderlineAvailable = (0, _validations.isMarkEnabled)(sdk.field, _richtexttypes.MARKS.BOLD) || (0, _validations.isMarkEnabled)(sdk.field, _richtexttypes.MARKS.ITALIC) || (0, _validations.isMarkEnabled)(sdk.field, _richtexttypes.MARKS.UNDERLINE);
    const dropdownItemsAvailable = dropdownMarks.some((mark)=>(0, _validations.isMarkEnabled)(sdk.field, mark));
    const shouldShowDropdown = boldItalicUnderlineAvailable && dropdownItemsAvailable;
    return /*#__PURE__*/ _react.createElement(_f36components.Flex, {
        gap: "spacingS",
        flexWrap: "wrap",
        flexDirection: "row",
        testId: "toolbar",
        className: styles.toolbar,
        justifyContent: "space-between"
    }, /*#__PURE__*/ _react.createElement("div", {
        className: styles.formattingOptionsWrapper
    }, /*#__PURE__*/ _react.createElement(_Heading.ToolbarHeadingButton, {
        isDisabled: isDisabled || !canInsertBlocks
    }), /*#__PURE__*/ _react.createElement("span", {
        className: styles.divider
    }), /*#__PURE__*/ _react.createElement(_ButtonUndo.ButtonUndo, null), /*#__PURE__*/ _react.createElement(_ButtonRedo.ButtonRedo, null), validationInfo.isAnyMarkEnabled && /*#__PURE__*/ _react.createElement("span", {
        className: styles.divider
    }), (0, _validations.isMarkEnabled)(sdk.field, _richtexttypes.MARKS.BOLD) && /*#__PURE__*/ _react.createElement(_Bold.ToolbarBoldButton, {
        isDisabled: isDisabled
    }), (0, _validations.isMarkEnabled)(sdk.field, _richtexttypes.MARKS.ITALIC) && /*#__PURE__*/ _react.createElement(_Italic.ToolbarItalicButton, {
        isDisabled: isDisabled
    }), (0, _validations.isMarkEnabled)(sdk.field, _richtexttypes.MARKS.UNDERLINE) && /*#__PURE__*/ _react.createElement(_Underline.ToolbarUnderlineButton, {
        isDisabled: isDisabled
    }), !boldItalicUnderlineAvailable && (0, _validations.isMarkEnabled)(sdk.field, _richtexttypes.MARKS.SUPERSCRIPT) && /*#__PURE__*/ _react.createElement(_Superscript.ToolbarSuperscriptButton, {
        isDisabled: isDisabled
    }), !boldItalicUnderlineAvailable && (0, _validations.isMarkEnabled)(sdk.field, _richtexttypes.MARKS.SUBSCRIPT) && /*#__PURE__*/ _react.createElement(_Subscript.ToolbarSubscriptButton, {
        isDisabled: isDisabled
    }), !boldItalicUnderlineAvailable && (0, _validations.isMarkEnabled)(sdk.field, _richtexttypes.MARKS.STRIKETHROUGH) && /*#__PURE__*/ _react.createElement(_Strikethrough.ToolbarStrikethroughButton, {
        isDisabled: isDisabled
    }), !boldItalicUnderlineAvailable && (0, _validations.isMarkEnabled)(sdk.field, _richtexttypes.MARKS.CODE) && /*#__PURE__*/ _react.createElement(_Code.ToolbarCodeButton, {
        isDisabled: isDisabled
    }), shouldShowDropdown && /*#__PURE__*/ _react.createElement(Dropdown, {
        sdk: sdk,
        isDisabled: isDisabled
    }), /*#__PURE__*/ _react.createElement("span", {
        className: styles.divider
    }), /*#__PURE__*/ _react.createElement(_Alignment.ToolbarAlignmentButtons, {
        isDisabled: isDisabled
    }), validationInfo.isAnyHyperlinkEnabled && /*#__PURE__*/ _react.createElement(_react.Fragment, null, /*#__PURE__*/ _react.createElement("span", {
        className: styles.divider
    }), /*#__PURE__*/ _react.createElement(_Hyperlink.ToolbarHyperlinkButton, {
        isDisabled: isDisabled
    })), validationInfo.isAnyBlockFormattingEnabled && /*#__PURE__*/ _react.createElement("span", {
        className: styles.divider
    }), /*#__PURE__*/ _react.createElement(_List.ToolbarListButton, {
        isDisabled: isDisabled || !canInsertBlocks
    }), (0, _validations.isNodeTypeEnabled)(sdk.field, _richtexttypes.BLOCKS.QUOTE) && /*#__PURE__*/ _react.createElement(_Quote.ToolbarQuoteButton, {
        isDisabled: isDisabled || !canInsertBlocks
    }), (0, _validations.isNodeTypeEnabled)(sdk.field, _richtexttypes.BLOCKS.HR) && /*#__PURE__*/ _react.createElement(_Hr.ToolbarHrButton, {
        isDisabled: isDisabled || !canInsertBlocks
    }), (0, _validations.isNodeTypeEnabled)(sdk.field, _richtexttypes.BLOCKS.TABLE) && /*#__PURE__*/ _react.createElement(_Table.ToolbarTableButton, {
        isDisabled: shouldDisableTables
    })), /*#__PURE__*/ _react.createElement("div", {
        className: styles.embedActionsWrapper
    }, /*#__PURE__*/ _react.createElement(_EmbedEntityWidget.EmbedEntityWidget, {
        isDisabled: isDisabled,
        canInsertBlocks: canInsertBlocks
    })));
};
function getValidationInfo(field) {
    const someWithValidation = (vals, validation)=>vals.some((val)=>validation(field, val));
    const isAnyMarkEnabled = someWithValidation(Object.values(_richtexttypes.MARKS), _validations.isMarkEnabled);
    const isAnyHyperlinkEnabled = someWithValidation([
        _richtexttypes.INLINES.HYPERLINK,
        _richtexttypes.INLINES.ASSET_HYPERLINK,
        _richtexttypes.INLINES.ENTRY_HYPERLINK,
        _richtexttypes.INLINES.RESOURCE_HYPERLINK
    ], _validations.isNodeTypeEnabled);
    const isAnyBlockFormattingEnabled = someWithValidation([
        _richtexttypes.BLOCKS.UL_LIST,
        _richtexttypes.BLOCKS.OL_LIST,
        _richtexttypes.BLOCKS.QUOTE,
        _richtexttypes.BLOCKS.HR
    ], _validations.isNodeTypeEnabled);
    return {
        isAnyMarkEnabled,
        isAnyHyperlinkEnabled,
        isAnyBlockFormattingEnabled
    };
}
const _default = Toolbar;
