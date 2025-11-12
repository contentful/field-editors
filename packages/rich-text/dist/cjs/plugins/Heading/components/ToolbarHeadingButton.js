"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "ToolbarHeadingButton", {
    enumerable: true,
    get: function() {
        return ToolbarHeadingButton;
    }
});
const _react = /*#__PURE__*/ _interop_require_wildcard(require("react"));
const _f36components = require("@contentful/f36-components");
const _f36icons = require("@contentful/f36-icons");
const _f36tokens = /*#__PURE__*/ _interop_require_default(require("@contentful/f36-tokens"));
const _richtexttypes = require("@contentful/rich-text-types");
const _emotion = require("emotion");
const _ContentfulEditorProvider = require("../../../ContentfulEditorProvider");
const _editor = require("../../../helpers/editor");
const _validations = require("../../../helpers/validations");
const _SdkProvider = require("../../../SdkProvider");
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
    button: (0, _emotion.css)({
        minWidth: '125px',
        justifyContent: 'space-between'
    }),
    dropdown: {
        root: (0, _emotion.css)`
      font-weight: ${_f36tokens.default.fontWeightDemiBold};
    `,
        [_richtexttypes.BLOCKS.PARAGRAPH]: (0, _emotion.css)`
      font-size: ${_f36tokens.default.fontSizeL};
    `,
        [_richtexttypes.BLOCKS.HEADING_1]: (0, _emotion.css)`
      font-size: 1.625rem;
    `,
        [_richtexttypes.BLOCKS.HEADING_2]: (0, _emotion.css)`
      font-size: 1.4375rem;
    `,
        [_richtexttypes.BLOCKS.HEADING_3]: (0, _emotion.css)`
      font-size: 1.25rem;
    `,
        [_richtexttypes.BLOCKS.HEADING_4]: (0, _emotion.css)`
      font-size: 1.125rem;
    `,
        [_richtexttypes.BLOCKS.HEADING_5]: (0, _emotion.css)`
      font-size: 1rem;
    `,
        [_richtexttypes.BLOCKS.HEADING_6]: (0, _emotion.css)`
      font-size: 0.875rem;
    `
    }
};
const LABELS = {
    [_richtexttypes.BLOCKS.PARAGRAPH]: 'Normal text',
    [_richtexttypes.BLOCKS.HEADING_1]: 'Heading 1',
    [_richtexttypes.BLOCKS.HEADING_2]: 'Heading 2',
    [_richtexttypes.BLOCKS.HEADING_3]: 'Heading 3',
    [_richtexttypes.BLOCKS.HEADING_4]: 'Heading 4',
    [_richtexttypes.BLOCKS.HEADING_5]: 'Heading 5',
    [_richtexttypes.BLOCKS.HEADING_6]: 'Heading 6'
};
function ToolbarHeadingButton(props) {
    const sdk = (0, _SdkProvider.useSdkContext)();
    const editor = (0, _ContentfulEditorProvider.useContentfulEditor)();
    const [isOpen, setOpen] = _react.useState(false);
    const [selected, setSelected] = _react.useState(_richtexttypes.BLOCKS.PARAGRAPH);
    _react.useEffect(()=>{
        if (!editor?.selection) return;
        const elements = (0, _editor.getElementFromCurrentSelection)(editor);
        for (const element of elements){
            if (typeof element === 'object' && 'type' in element) {
                const el = element;
                const match = LABELS[el.type];
                if (match) {
                    setSelected(el.type);
                    return;
                }
            }
        }
        setSelected(_richtexttypes.BLOCKS.PARAGRAPH);
    }, [
        editor?.operations,
        editor?.selection
    ]);
    const [nodeTypesByEnablement, someHeadingsEnabled] = _react.useMemo(()=>{
        const nodeTypesByEnablement = Object.fromEntries(Object.keys(LABELS).map((nodeType)=>[
                nodeType,
                (0, _validations.isNodeTypeEnabled)(sdk.field, nodeType)
            ]));
        const someHeadingsEnabled = Object.values(nodeTypesByEnablement).filter(Boolean).length > 0;
        return [
            nodeTypesByEnablement,
            someHeadingsEnabled
        ];
    }, [
        sdk.field
    ]);
    function handleOnSelectItem(type) {
        return (event)=>{
            event.preventDefault();
            if (!editor?.selection) return;
            setSelected(type);
            setOpen(false);
            const prevOnChange = editor.onChange;
            editor.onChange = (...args)=>{
                (0, _editor.focus)(editor);
                editor.onChange = prevOnChange;
                prevOnChange(...args);
            };
            if (type !== _richtexttypes.BLOCKS.PARAGRAPH) {
                const isActive = (0, _editor.isBlockSelected)(editor, type);
                editor.tracking.onToolbarAction(isActive ? 'remove' : 'insert', {
                    nodeType: type
                });
            }
            (0, _editor.toggleElement)(editor, {
                activeType: type,
                inactiveType: type
            });
        };
    }
    if (!editor) return null;
    return /*#__PURE__*/ _react.createElement(_f36components.Menu, {
        isOpen: isOpen,
        onClose: ()=>setOpen(false)
    }, /*#__PURE__*/ _react.createElement(_f36components.Menu.Trigger, null, /*#__PURE__*/ _react.createElement(_f36components.Button, {
        size: "small",
        testId: "toolbar-heading-toggle",
        variant: "transparent",
        endIcon: /*#__PURE__*/ _react.createElement(_f36icons.CaretDownIcon, null),
        isDisabled: props.isDisabled,
        onClick: ()=>someHeadingsEnabled && setOpen(!isOpen),
        className: styles.button
    }, LABELS[selected])), /*#__PURE__*/ _react.createElement(_f36components.Menu.List, {
        testId: "dropdown-heading-list"
    }, Object.keys(LABELS).map((nodeType)=>nodeTypesByEnablement[nodeType] && /*#__PURE__*/ _react.createElement(_f36components.Menu.Item, {
            key: nodeType,
            isInitiallyFocused: selected === nodeType,
            onClick: handleOnSelectItem(nodeType),
            testId: `dropdown-option-${nodeType}`,
            disabled: props.isDisabled
        }, /*#__PURE__*/ _react.createElement("span", {
            className: (0, _emotion.cx)(styles.dropdown.root, styles.dropdown[nodeType])
        }, LABELS[nodeType]))).filter(Boolean)));
}
