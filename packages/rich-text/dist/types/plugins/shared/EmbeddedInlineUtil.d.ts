import { FieldAppSDK } from '@contentful/app-sdk';
import { INLINES } from '@contentful/rich-text-types';
import { HotkeyPlugin } from '@udecode/plate-common';
import { KeyboardHandler } from '../../internal/types';
import { TrackingPluginActions } from '../../plugins/Tracking';
export declare function getWithEmbeddedEntryInlineEvents(nodeType: INLINES.EMBEDDED_ENTRY | INLINES.EMBEDDED_RESOURCE, sdk: FieldAppSDK): KeyboardHandler<HotkeyPlugin>;
export declare function selectEntityAndInsert(editor: any, sdk: any, logAction: TrackingPluginActions['onShortcutAction'] | TrackingPluginActions['onToolbarAction']): Promise<void>;
export declare function selectResourceEntityAndInsert(editor: any, sdk: any, logAction: TrackingPluginActions['onToolbarAction'] | TrackingPluginActions['onShortcutAction']): Promise<void>;
