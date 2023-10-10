import * as React from 'react';

import { FieldAppSDK } from '@contentful/app-sdk';
import { Menu, Flex } from '@contentful/f36-components';
import { EmbeddedEntryInlineIcon } from '@contentful/f36-icons';
import tokens from '@contentful/f36-tokens';
import { Entry } from '@contentful/field-editor-shared';
import { INLINES } from '@contentful/rich-text-types';
import { HotkeyPlugin } from '@udecode/plate-common';
import { css } from 'emotion';
import isHotkey from 'is-hotkey';

import { useContentfulEditor } from '../../ContentfulEditorProvider';
import { focus, moveToTheNextChar } from '../../helpers/editor';
import newEntitySelectorConfigFromRichTextField from '../../helpers/newEntitySelectorConfigFromRichTextField';
import { watchCurrentSlide } from '../../helpers/sdkNavigatorSlideIn';
import { insertNodes, select } from '../../internal/transforms';
import { KeyboardHandler, PlatePlugin, Node } from '../../internal/types';
import { TrackingPluginActions } from '../../plugins/Tracking';
import { useSdkContext } from '../../SdkProvider';
import { LinkedEntityInline } from './LinkedEntityInline';
import { createInlineEntryNode } from './Util';

const styles = {
  icon: css({
    marginRight: '10px',
  }),

  root: css({
    display: 'inline-block',
    margin: `0 ${tokens.spacing2Xs}`,
    fontSize: 'inherit',
    span: {
      userSelect: 'none',
    },
  }),
};

interface ToolbarEmbeddedEntityInlineButtonProps {
  onClose: () => void;
  isDisabled: boolean;
}

async function selectEntityAndInsert(
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

export function ToolbarEmbeddedEntityInlineButton(props: ToolbarEmbeddedEntityInlineButtonProps) {
  const editor = useContentfulEditor();
  const sdk: FieldAppSDK = useSdkContext();

  async function handleClick(event) {
    event.preventDefault();

    if (!editor) return;

    props.onClose();

    await selectEntityAndInsert(editor, sdk, editor.tracking.onToolbarAction);
    moveToTheNextChar(editor);
  }

  return (
    <Menu.Item
      disabled={props.isDisabled}
      className="rich-text__entry-link-block-button"
      testId={`toolbar-toggle-${INLINES.EMBEDDED_ENTRY}`}
      onClick={handleClick}
    >
      <Flex alignItems="center" flexDirection="row">
        <EmbeddedEntryInlineIcon
          variant="secondary"
          className={`rich-text__embedded-entry-list-icon ${styles.icon}`}
        />
        <span>Inline entry</span>
      </Flex>
    </Menu.Item>
  );
}

export function createEmbeddedEntityInlinePlugin(sdk: FieldAppSDK): PlatePlugin {
  const htmlAttributeName = 'data-embedded-entity-inline-id';

  return {
    key: INLINES.EMBEDDED_ENTRY,
    type: INLINES.EMBEDDED_ENTRY,
    isElement: true,
    isInline: true,
    isVoid: true,
    component: LinkedEntityInline,
    options: {
      hotkey: 'mod+shift+2',
    },
    handlers: {
      onKeyDown: getWithEmbeddedEntryInlineEvents(sdk),
    },
    deserializeHtml: {
      rules: [
        {
          validAttribute: htmlAttributeName,
        },
      ],
      withoutChildren: true,
      getNode: (el): Node => createInlineEntryNode(el.getAttribute(htmlAttributeName) as string),
    },
  };
}

function getWithEmbeddedEntryInlineEvents(sdk: FieldAppSDK): KeyboardHandler<HotkeyPlugin> {
  return function withEmbeddedEntryInlineEvents(editor, { options: { hotkey } }) {
    return function handleEvent(event) {
      if (!editor) return;

      if (hotkey && isHotkey(hotkey, event)) {
        selectEntityAndInsert(editor, sdk, editor.tracking.onShortcutAction);
      }
    };
  };
}
