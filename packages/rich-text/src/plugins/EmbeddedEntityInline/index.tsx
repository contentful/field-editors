import * as React from 'react';

import { Link, FieldExtensionSDK } from '@contentful/app-sdk';
import { Menu, Flex } from '@contentful/f36-components';
import { EmbeddedEntryInlineIcon } from '@contentful/f36-icons';
import tokens from '@contentful/f36-tokens';
import { Entry } from '@contentful/field-editor-shared';
import { INLINES } from '@contentful/rich-text-types';
import { css } from 'emotion';
import isHotkey from 'is-hotkey';
import { useSelected, useReadOnly } from 'slate-react';

import { useContentfulEditor } from '../../ContentfulEditorProvider';
import { focus, moveToTheNextChar } from '../../helpers/editor';
import { IS_CHROME } from '../../helpers/environment';
import newEntitySelectorConfigFromRichTextField from '../../helpers/newEntitySelectorConfigFromRichTextField';
import { watchCurrentSlide } from '../../helpers/sdkNavigatorSlideIn';
import { findNodePath } from '../../internal/queries';
import { insertNodes, removeNodes, select } from '../../internal/transforms';
import { KeyboardHandler, PlatePlugin, Node } from '../../internal/types';
import type { Element, RenderElementProps, HotkeyPlugin } from '../../internal/types';
import { TrackingPluginActions } from '../../plugins/Tracking';
import { useSdkContext } from '../../SdkProvider';
import { withLinkTracking } from '../links-tracking';
import { FetchingWrappedInlineEntryCard } from './FetchingWrappedInlineEntryCard';
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

type EmbeddedEntityInlineProps = {
  target: Link;
  element: Element & {
    data: {
      target: {
        sys: {
          id: string;
          linkType: 'Entry' | 'Asset';
          type: 'Link';
        };
      };
    };
  };
  attributes: Pick<RenderElementProps, 'attributes'>;
  children: Pick<RenderElementProps, 'children'>;
  onEntityFetchComplete: VoidFunction;
};

function EmbeddedEntityInline(props: EmbeddedEntityInlineProps) {
  const editor = useContentfulEditor();
  const sdk = useSdkContext();
  const isSelected = useSelected();
  const { id: entryId } = props.element.data.target.sys;
  const isDisabled = useReadOnly();

  function handleEditClick() {
    return sdk.navigator.openEntry(entryId, { slideIn: { waitForClose: true } }).then(() => {
      editor && focus(editor);
    });
  }

  function handleRemoveClick() {
    if (!editor) return;
    const pathToElement = findNodePath(editor, props.element);
    removeNodes(editor, { at: pathToElement });
  }

  return (
    <span
      {...props.attributes}
      className={styles.root}
      data-embedded-entity-inline-id={entryId}
      // COMPAT: This makes copy & paste work for Firefox
      contentEditable={IS_CHROME ? undefined : false}
      draggable={IS_CHROME ? true : undefined}
    >
      <span
        // COMPAT: This makes copy & paste work for Chromium/Blink browsers and Safari
        contentEditable={IS_CHROME ? false : undefined}
        draggable={IS_CHROME ? true : undefined}
      >
        <FetchingWrappedInlineEntryCard
          sdk={sdk}
          entryId={entryId}
          isSelected={isSelected}
          isDisabled={isDisabled}
          onRemove={handleRemoveClick}
          onEdit={handleEditClick}
          onEntityFetchComplete={props.onEntityFetchComplete}
        />
      </span>
      {props.children}
    </span>
  );
}

interface ToolbarEmbeddedEntityInlineButtonProps {
  onClose: () => void;
  isDisabled: boolean;
}

async function selectEntityAndInsert(
  editor,
  sdk: FieldExtensionSDK,
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
  const sdk: FieldExtensionSDK = useSdkContext();

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

export function createEmbeddedEntityInlinePlugin(sdk: FieldExtensionSDK): PlatePlugin {
  const htmlAttributeName = 'data-embedded-entity-inline-id';

  return {
    key: INLINES.EMBEDDED_ENTRY,
    type: INLINES.EMBEDDED_ENTRY,
    isElement: true,
    isInline: true,
    isVoid: true,
    component: withLinkTracking(EmbeddedEntityInline),
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

function getWithEmbeddedEntryInlineEvents(sdk: FieldExtensionSDK): KeyboardHandler<HotkeyPlugin> {
  return function withEmbeddedEntryInlineEvents(editor, { options: { hotkey } }) {
    return function handleEvent(event) {
      if (!editor) return;

      if (hotkey && isHotkey(hotkey, event)) {
        selectEntityAndInsert(editor, sdk, editor.tracking.onShortcutAction);
      }
    };
  };
}
