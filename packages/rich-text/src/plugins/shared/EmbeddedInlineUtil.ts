import { FieldAppSDK } from '@contentful/app-sdk';
import { INLINES } from '@contentful/rich-text-types';
import { HotkeyPlugin } from '@udecode/plate-common';
import isHotkey from 'is-hotkey';

import {
  newEntitySelectorConfigFromRichTextField,
  newResourceEntitySelectorConfigFromRichTextField,
} from '../../helpers/config';
import { focus } from '../../helpers/editor';
import { watchCurrentSlide } from '../../helpers/sdkNavigatorSlideIn';
import { insertNodes, select } from '../../internal/transforms';
import { KeyboardHandler } from '../../internal/types';
import { TrackingPluginActions } from '../../plugins/Tracking';

export function getWithEmbeddedEntryInlineEvents(
  nodeType: INLINES.EMBEDDED_ENTRY | INLINES.EMBEDDED_RESOURCE,
  sdk: FieldAppSDK
): KeyboardHandler<HotkeyPlugin> {
  return function withEmbeddedEntryInlineEvents(editor, { options: { hotkey } }) {
    return function handleEvent(event) {
      if (!editor) return;

      if (hotkey && isHotkey(hotkey, event)) {
        if (nodeType === INLINES.EMBEDDED_RESOURCE) {
          selectResourceEntityAndInsert(editor, sdk, editor.tracking.onShortcutAction);
        } else {
          selectEntityAndInsert(editor, sdk, editor.tracking.onShortcutAction);
        }
      }
    };
  };
}

const getLink = (nodeType: INLINES, entity) => {
  if (nodeType === INLINES.EMBEDDED_RESOURCE) {
    return {
      urn: entity.sys.urn,
      type: 'ResourceLink',
      linkType: 'Contentful:Entry',
    };
  }
  return {
    id: entity.sys.id,
    type: 'Link',
    linkType: entity.sys.type,
  };
};

const createInlineEntryNode = (nodeType, entity) => {
  return {
    type: nodeType,
    children: [{ text: '' }],
    data: {
      target: {
        sys: getLink(nodeType, entity),
      },
    },
  };
};

export async function selectEntityAndInsert(
  editor,
  sdk,
  logAction: TrackingPluginActions['onShortcutAction'] | TrackingPluginActions['onToolbarAction']
) {
  const nodeType = INLINES.EMBEDDED_ENTRY;
  logAction('openCreateEmbedDialog', { nodeType });

  const config = {
    ...newEntitySelectorConfigFromRichTextField(sdk.field, nodeType),
    withCreate: true,
  };
  const { selection } = editor;
  const rteSlide = watchCurrentSlide(sdk.navigator);
  const entry = await sdk.dialogs.selectSingleEntry(config);

  if (!entry) {
    logAction('cancelCreateEmbedDialog', { nodeType });
  } else {
    // Selection prevents incorrect position of inserted ref when RTE doesn't have focus
    // (i.e. when using hotkeys and slide-in)
    select(editor, selection);
    insertNodes(editor, createInlineEntryNode(nodeType, entry));
    logAction('insert', { nodeType });
  }
  rteSlide.onActive(() => {
    rteSlide.unwatch();
    focus(editor);
  });
}

export async function selectResourceEntityAndInsert(
  editor,
  sdk,
  logAction: TrackingPluginActions['onToolbarAction'] | TrackingPluginActions['onShortcutAction']
) {
  const nodeType = INLINES.EMBEDDED_RESOURCE;
  logAction('openCreateEmbedDialog', { nodeType });

  const { dialogs, field } = sdk;
  const config = {
    ...newResourceEntitySelectorConfigFromRichTextField(field, nodeType),
    withCreate: true,
  };

  const { selection } = editor;
  const entry = await dialogs.selectSingleResourceEntry(config);

  if (!entry) {
    logAction('cancelCreateEmbedDialog', { nodeType });
  } else {
    // Selection prevents incorrect position of inserted ref when RTE doesn't have focus
    // (i.e. when using hotkeys and slide-in)
    select(editor, selection);
    insertNodes(editor, createInlineEntryNode(nodeType, entry));
    logAction('insert', { nodeType });
  }
}
