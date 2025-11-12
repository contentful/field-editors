import { KeyboardHandler, HotkeyPlugin, PlateEditor } from '../../internal/types';
import { TrackingPluginActions } from '../../plugins/Tracking';
export declare function toggleQuote(editor: PlateEditor, logAction?: TrackingPluginActions['onShortcutAction'] | TrackingPluginActions['onToolbarAction']): void;
export declare const onKeyDownToggleQuote: KeyboardHandler<HotkeyPlugin>;
