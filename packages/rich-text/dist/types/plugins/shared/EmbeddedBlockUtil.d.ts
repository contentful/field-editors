import { FieldAppSDK } from '@contentful/app-sdk';
import { BLOCKS } from '@contentful/rich-text-types';
import { HotkeyPlugin } from '@udecode/plate-common';
import { KeyboardHandler } from '../../internal';
import { TrackingPluginActions } from '../Tracking';
export declare function getWithEmbeddedBlockEvents(nodeType: BLOCKS.EMBEDDED_ENTRY | BLOCKS.EMBEDDED_ASSET | BLOCKS.EMBEDDED_RESOURCE, sdk: FieldAppSDK): KeyboardHandler<HotkeyPlugin>;
export declare function selectEntityAndInsert(nodeType: any, sdk: any, editor: any, logAction: TrackingPluginActions['onToolbarAction'] | TrackingPluginActions['onShortcutAction']): Promise<void>;
export declare function selectResourceEntityAndInsert(sdk: any, editor: any, logAction: TrackingPluginActions['onToolbarAction'] | TrackingPluginActions['onShortcutAction']): Promise<void>;
