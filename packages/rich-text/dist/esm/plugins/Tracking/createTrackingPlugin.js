import { getCharacterCount } from './utils';
const actionOrigin = {
    TOOLBAR: 'toolbar-icon',
    SHORTCUT: 'shortcut',
    VIEWPORT: 'viewport-interaction',
    SHORTCUT_OR_VIEWPORT: 'shortcut-or-viewport',
    COMMAND_PALETTE: 'command-palette'
};
export function getPastingSource(data) {
    const textHtml = data.getData('text/html');
    const doc = new DOMParser().parseFromString(textHtml, 'text/html');
    if (doc.querySelector('[id*="docs-internal-guid"]')) {
        return 'Google Docs';
    }
    if (doc.querySelector('google-sheets-html-origin') || doc.querySelector('[data-sheets-value]')) {
        return 'Google Spreadsheets';
    }
    if (doc.querySelector('meta[content*="Microsoft Excel"]')) {
        return 'Microsoft Excel';
    }
    if (doc.querySelector('meta[content*="Microsoft Word"]')) {
        return 'Microsoft Word';
    }
    if (doc.querySelector('[style*="Arial_MSFontService"]') && (doc.querySelector('.TextRun') || doc.querySelector('.OutlineElement'))) {
        return 'Microsoft Word Online';
    }
    if (doc.querySelector('meta[content="Cocoa HTML Writer"]')) {
        return 'Apple Notes';
    }
    if (doc.querySelector('[style*="Slack-Lato, Slack-Fractions"]')) {
        return 'Slack';
    }
    return 'Unknown';
}
export const createTrackingPlugin = (onAction)=>{
    const trackingActions = {
        onViewportAction: (actionName, data = {})=>onAction(actionName, {
                origin: actionOrigin.VIEWPORT,
                ...data
            }),
        onShortcutAction: (actionName, data = {})=>onAction(actionName, {
                origin: actionOrigin.SHORTCUT,
                ...data
            }),
        onShortcutOrViewportAction: (actionName, data = {})=>onAction(actionName, {
                origin: actionOrigin.SHORTCUT_OR_VIEWPORT,
                ...data
            }),
        onToolbarAction: (actionName, data = {})=>onAction(actionName, {
                origin: actionOrigin.TOOLBAR,
                ...data
            }),
        onCommandPaletteAction: (actionName, data = {})=>onAction(actionName, {
                origin: actionOrigin.COMMAND_PALETTE,
                ...data
            })
    };
    return {
        key: 'TrackingPlugin',
        withOverrides: (editor)=>{
            const { insertData, undo, redo } = editor;
            editor.tracking = trackingActions;
            editor.insertData = (data)=>{
                const isCopyAndPaste = data.types.length !== 0;
                if (isCopyAndPaste) {
                    const characterCountSelection = window.getSelection()?.toString().length;
                    const characterCountBefore = getCharacterCount(editor);
                    setTimeout(()=>{
                        const characterCountAfter = getCharacterCount(editor);
                        trackingActions.onShortcutOrViewportAction('paste', {
                            characterCountAfter,
                            characterCountBefore,
                            characterCountSelection,
                            source: getPastingSource(data)
                        });
                    });
                }
                insertData(data);
            };
            editor.undo = (source)=>{
                undo();
                if (source === 'toolbar') {
                    editor.tracking.onToolbarAction('undo');
                } else {
                    editor.tracking.onShortcutAction('undo');
                }
            };
            editor.redo = (source)=>{
                redo();
                if (source === 'toolbar') {
                    editor.tracking.onToolbarAction('redo');
                } else {
                    editor.tracking.onShortcutAction('redo');
                }
            };
            return editor;
        }
    };
};
