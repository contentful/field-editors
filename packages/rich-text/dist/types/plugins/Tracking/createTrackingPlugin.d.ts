import { PlatePlugin } from '../../internal/types';
export type RichTextTrackingActionName = 'edit' | 'insert' | 'remove' | 'mark' | 'unmark' | 'insertTable' | 'insertTableRow' | 'insertTableColumn' | 'removeTable' | 'removeTableRow' | 'removeTableColumn' | 'paste' | 'invalidTablePaste' | 'undo' | 'redo' | 'cancelCreateHyperlinkDialog' | 'cancelEditHyperlinkDialog' | 'linkRendered' | 'openCreateHyperlinkDialog' | 'openEditHyperlinkDialog' | 'unlinkHyperlinks' | 'openCreateEmbedDialog' | 'cancelCreateEmbedDialog' | 'openRichTextCommandPalette' | 'cancelRichTextCommandPalette';
export type RichTextTrackingActionHandler = (name: RichTextTrackingActionName, data: Record<string, unknown>) => unknown;
export interface TrackingPluginActions {
    onViewportAction: (actionName: RichTextTrackingActionName, data?: Record<string, unknown>) => ReturnType<RichTextTrackingActionHandler>;
    onShortcutAction: (actionName: RichTextTrackingActionName, data?: Record<string, unknown>) => ReturnType<RichTextTrackingActionHandler>;
    onShortcutOrViewportAction: (actionName: RichTextTrackingActionName, data?: Record<string, unknown>) => ReturnType<RichTextTrackingActionHandler>;
    onToolbarAction: (actionName: RichTextTrackingActionName, data?: Record<string, unknown>) => ReturnType<RichTextTrackingActionHandler>;
    onCommandPaletteAction: (actionName: RichTextTrackingActionName, data?: Record<string, unknown>) => ReturnType<RichTextTrackingActionHandler>;
}
export declare function getPastingSource(data: DataTransfer): "Google Docs" | "Google Spreadsheets" | "Microsoft Excel" | "Microsoft Word" | "Microsoft Word Online" | "Apple Notes" | "Slack" | "Unknown";
export declare const createTrackingPlugin: (onAction: RichTextTrackingActionHandler) => PlatePlugin;
