import { useEffect, useState } from 'react';
import { useContentfulEditor } from '../../../ContentfulEditorProvider';
import { findNodePath, isChildPath } from '../../../internal/queries';
import { useSdkContext } from '../../../SdkProvider';
export function useHyperlinkCommon(element) {
    const editor = useContentfulEditor();
    const sdk = useSdkContext();
    const focus = editor.selection?.focus;
    const pathToElement = findNodePath(editor, element);
    const isLinkFocused = pathToElement && focus && isChildPath(focus.path, pathToElement);
    const [isEditorFocused, setIsEditorFocused] = useState(false);
    useEffect(()=>{
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
