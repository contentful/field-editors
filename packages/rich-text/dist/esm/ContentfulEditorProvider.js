import { createContext, useContext } from 'react';
import { usePlateEditorRef, usePlateEditorState } from './internal/hooks';
export function getContentfulEditorId(sdk) {
    const { entry, field } = sdk;
    const sys = entry.getSys();
    return `rich-text-editor-${sys.id}-${field.id}-${field.locale}`;
}
export const editorContext = createContext('');
export const ContentfulEditorIdProvider = editorContext.Provider;
export function useContentfulEditorId(id) {
    const contextId = useContext(editorContext);
    if (id) {
        return id;
    }
    if (!contextId) {
        throw new Error('could not find editor id. Please ensure the component is wrapped in <ContentfulEditorIdProvider> ');
    }
    return contextId;
}
export function useContentfulEditor(id) {
    const editorId = useContentfulEditorId(id);
    const editor = usePlateEditorState(editorId);
    return editor;
}
export function useContentfulEditorRef(id) {
    const editorId = useContentfulEditorId(id);
    const editor = usePlateEditorRef(editorId);
    return editor;
}
