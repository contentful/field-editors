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
    ContentfulEditorIdProvider: function() {
        return ContentfulEditorIdProvider;
    },
    editorContext: function() {
        return editorContext;
    },
    getContentfulEditorId: function() {
        return getContentfulEditorId;
    },
    useContentfulEditor: function() {
        return useContentfulEditor;
    },
    useContentfulEditorId: function() {
        return useContentfulEditorId;
    },
    useContentfulEditorRef: function() {
        return useContentfulEditorRef;
    }
});
const _react = require("react");
const _hooks = require("./internal/hooks");
function getContentfulEditorId(sdk) {
    const { entry, field } = sdk;
    const sys = entry.getSys();
    return `rich-text-editor-${sys.id}-${field.id}-${field.locale}`;
}
const editorContext = (0, _react.createContext)('');
const ContentfulEditorIdProvider = editorContext.Provider;
function useContentfulEditorId(id) {
    const contextId = (0, _react.useContext)(editorContext);
    if (id) {
        return id;
    }
    if (!contextId) {
        throw new Error('could not find editor id. Please ensure the component is wrapped in <ContentfulEditorIdProvider> ');
    }
    return contextId;
}
function useContentfulEditor(id) {
    const editorId = useContentfulEditorId(id);
    const editor = (0, _hooks.usePlateEditorState)(editorId);
    return editor;
}
function useContentfulEditorRef(id) {
    const editorId = useContentfulEditorId(id);
    const editor = (0, _hooks.usePlateEditorRef)(editorId);
    return editor;
}
