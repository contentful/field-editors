import { useCallback } from 'react';
import { useContentfulEditorRef } from '../ContentfulEditorProvider';
export function useLinkTracking() {
    const editor = useContentfulEditorRef();
    return {
        onEntityFetchComplete: useCallback(()=>editor?.tracking.onViewportAction('linkRendered'), [
            editor
        ])
    };
}
