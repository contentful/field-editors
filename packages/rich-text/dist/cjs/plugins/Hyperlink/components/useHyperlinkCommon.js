"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "useHyperlinkCommon", {
    enumerable: true,
    get: function() {
        return useHyperlinkCommon;
    }
});
const _react = require("react");
const _ContentfulEditorProvider = require("../../../ContentfulEditorProvider");
const _queries = require("../../../internal/queries");
const _SdkProvider = require("../../../SdkProvider");
function useHyperlinkCommon(element) {
    const editor = (0, _ContentfulEditorProvider.useContentfulEditor)();
    const sdk = (0, _SdkProvider.useSdkContext)();
    const focus = editor.selection?.focus;
    const pathToElement = (0, _queries.findNodePath)(editor, element);
    const isLinkFocused = pathToElement && focus && (0, _queries.isChildPath)(focus.path, pathToElement);
    const [isEditorFocused, setIsEditorFocused] = (0, _react.useState)(false);
    (0, _react.useEffect)(()=>{
        const handleFocus = ()=>setIsEditorFocused(true);
        const handleBlur = ()=>setIsEditorFocused(false);
        const editorElement = document.getElementById(editor.id);
        if (editorElement) {
            setIsEditorFocused(document.activeElement === editorElement);
            editorElement.addEventListener('focus', handleFocus);
            editorElement.addEventListener('blur', handleBlur);
        }
        return ()=>{
            if (editorElement) {
                editorElement.removeEventListener('focus', handleFocus);
                editorElement.removeEventListener('blur', handleBlur);
            }
        };
    }, [
        editor
    ]);
    return {
        editor,
        sdk,
        isLinkFocused,
        pathToElement,
        isEditorFocused
    };
}
