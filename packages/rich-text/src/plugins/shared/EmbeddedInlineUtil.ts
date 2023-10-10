import { FieldAppSDK } from '@contentful/app-sdk';
import { Entry } from '@contentful/field-editor-shared';
import { INLINES } from '@contentful/rich-text-types';
import { HotkeyPlugin } from '@udecode/plate-common';
import isHotkey from 'is-hotkey';

import { focus } from '../../helpers/editor';
import newEntitySelectorConfigFromRichTextField from '../../helpers/newEntitySelectorConfigFromRichTextField';
import { watchCurrentSlide } from '../../helpers/sdkNavigatorSlideIn';
import { insertNodes, select } from '../../internal/transforms';
import { KeyboardHandler } from '../../internal/types';
import { TrackingPluginActions } from '../../plugins/Tracking';

export function getWithEmbeddedEntryInlineEvents(sdk: FieldAppSDK): KeyboardHandler<HotkeyPlugin> {
  return function withEmbeddedEntryInlineEvents(editor, { options: { hotkey } }) {
    return function handleEvent(event) {
      if (!editor) return;

      if (hotkey && isHotkey(hotkey, event)) {
        selectEntityAndInsert(editor, sdk, editor.tracking.onShortcutAction);
      }
    };
  };
}

export async function selectEntityAndInsert(
  editor,
  sdk: FieldAppSDK,
  logAction: TrackingPluginActions['onShortcutAction'] | TrackingPluginActions['onToolbarAction']
) {
  logAction('openCreateEmbedDialog', { nodeType: INLINES.EMBEDDED_ENTRY });

  const config = {
    ...newEntitySelectorConfigFromRichTextField(sdk.field, INLINES.EMBEDDED_ENTRY),
    withCreate: true,
  };
  const { selection } = editor;
  const rteSlide = watchCurrentSlide(sdk.navigator);
  const entry = await sdk.dialogs.selectSingleEntry<Entry>(config);

  if (!entry) {
    logAction('cancelCreateEmbedDialog', { nodeType: INLINES.EMBEDDED_ENTRY });
  } else {
    // Selection prevents incorrect position of inserted ref when RTE doesn't have focus
    // (i.e. when using hotkeys and slide-in)
    select(editor, selection);
    insertNodes(editor, createInlineEntryNode(entry.sys.id));
    logAction('insert', { nodeType: INLINES.EMBEDDED_ENTRY });
  }
  rteSlide.onActive(() => {
    rteSlide.unwatch();
    focus(editor);
  });
}

export function createInlineEntryNode(id: string) {
  return {
    type: INLINES.EMBEDDED_ENTRY,
    children: [{ text: '' }],
    data: {
      target: {
        sys: {
          id,
          type: 'Link',
          linkType: 'Entry',
        },
      },
    },
  };
}
