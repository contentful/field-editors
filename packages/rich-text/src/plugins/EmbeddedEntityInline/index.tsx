import * as React from 'react';
import {
  PlatePlugin,
  getRenderElement,
  getPlatePluginTypes,
  getPlatePluginOptions,
} from '@udecode/plate-core';
import { Transforms } from 'slate';
import { INLINES } from '@contentful/rich-text-types';
import { useSelected, ReactEditor, useReadOnly } from 'slate-react';
import { Button, DropdownListItem, Icon, Flex } from '@contentful/forma-36-react-components';
import { css } from 'emotion';
import { Link, FieldExtensionSDK } from '@contentful/app-sdk';
import { Entry } from '@contentful/field-editor-shared';
import { CustomSlatePluginOptions, CustomRenderElementProps } from '../../types';
import newEntitySelectorConfigFromRichTextField from '../../helpers/newEntitySelectorConfigFromRichTextField';
import { useSdkContext } from '../../SdkProvider';
import { FetchingWrappedInlineEntryCard } from './FetchingWrappedInlineEntryCard';
import { createInlineEntryNode } from './Util';
import { useContentfulEditor } from '../../ContentfulEditorProvider';

const styles = {
  icon: css({
    marginRight: '10px',
  }),

  root: css({
    margin: '0 1px',
    fontSize: 'inherit',
    span: {
      webkitUserSelect: 'none',
      mozUserSelect: 'none',
      msUserSelect: 'none',
      userSelect: 'none',
    },
  }),
};

type EmbeddedEntityInlineProps = CustomRenderElementProps<{
  target: Link;
}>;

function EmbeddedEntityInline(props: EmbeddedEntityInlineProps) {
  const editor = useContentfulEditor();
  const sdk = useSdkContext();
  const isSelected = useSelected();
  const { id: entryId } = props.element.data.target.sys;
  const isDisabled = useReadOnly();

  function handleEditClick() {
    return sdk.navigator.openEntry(entryId, { slideIn: true });
  }

  function handleRemoveClick() {
    if (!editor) return;
    const pathToElement = ReactEditor.findPath(editor, props.element);
    Transforms.removeNodes(editor, { at: pathToElement });
  }

  return (
    <span {...props.attributes} className={styles.root} data-embedded-entity-inline-id={entryId}>
      <span contentEditable={false}>
        <FetchingWrappedInlineEntryCard
          sdk={sdk}
          entryId={entryId}
          isSelected={isSelected}
          isDisabled={isDisabled}
          onRemove={handleRemoveClick}
          onEdit={handleEditClick}
        />
      </span>
      {props.children}
    </span>
  );
}

interface ToolbarEmbeddedEntityInlineButtonProps {
  onClose: () => void;
  isDisabled: boolean;
  isButton?: boolean;
}

async function selectEntityAndInsert(editor, sdk: FieldExtensionSDK) {
  const config = {
    ...newEntitySelectorConfigFromRichTextField(sdk.field, INLINES.EMBEDDED_ENTRY),
    withCreate: true,
  };
  const selection = editor.selection;

  const entry = await sdk.dialogs.selectSingleEntry<Entry>(config);
  ReactEditor.focus(editor); // Dialog steals focus from editor, return it.
  if (!entry) return;

  const inlineEntryNode = createInlineEntryNode(entry.sys.id);

  // Got to wait until focus is really back on the editor or setSelection() won't work.
  setTimeout(() => {
    Transforms.setSelection(editor, selection);
    Transforms.insertNodes(editor, inlineEntryNode);
  }, 0);
}

export function ToolbarEmbeddedEntityInlineButton(props: ToolbarEmbeddedEntityInlineButtonProps) {
  const editor = useContentfulEditor();
  const sdk: FieldExtensionSDK = useSdkContext();

  async function handleClick(event) {
    event.preventDefault();

    if (!editor) return;

    props.onClose();

    await selectEntityAndInsert(editor, sdk);
  }

  return props.isButton ? (
    <Button
      disabled={props.isDisabled}
      className={`${INLINES.EMBEDDED_ENTRY}-button`}
      size="small"
      onClick={handleClick}
      icon="EmbeddedEntryInline"
      buttonType="muted"
      testId={`toolbar-toggle-${INLINES.EMBEDDED_ENTRY}`}>
      Embed inline entry
    </Button>
  ) : (
    <DropdownListItem
      isDisabled={props.isDisabled}
      className="rich-text__entry-link-block-button"
      testId={`toolbar-toggle-${INLINES.EMBEDDED_ENTRY}`}
      onClick={handleClick}>
      <Flex alignItems="center" flexDirection="row">
        <Icon
          icon="EmbeddedEntryInline"
          color="secondary"
          className={`rich-text__embedded-entry-list-icon ${styles.icon}`}
        />
        <span>Inline entry</span>
      </Flex>
    </DropdownListItem>
  );
}

export function createEmbeddedEntityInlinePlugin(sdk): PlatePlugin {
  return {
    renderElement: getRenderElement(INLINES.EMBEDDED_ENTRY),
    pluginKeys: INLINES.EMBEDDED_ENTRY,
    inlineTypes: getPlatePluginTypes(INLINES.EMBEDDED_ENTRY),
    onKeyDown: getWithEmbeddedEntryInlineEvents(sdk),
    deserialize: (editor) => {
      const options = getPlatePluginOptions(editor, INLINES.EMBEDDED_ENTRY);

      return {
        element: [
          {
            type: INLINES.EMBEDDED_ENTRY,
            deserialize: (element) => {
              const entryId = element.getAttribute('data-embedded-entity-inline-id');
              return entryId ? createInlineEntryNode(entryId) : undefined;
            },
            ...options.deserialize,
          },
        ],
      };
    },
  };
}

export const withEmbeddedEntityInlineOptions: CustomSlatePluginOptions = {
  [INLINES.EMBEDDED_ENTRY]: {
    type: INLINES.EMBEDDED_ENTRY,
    component: EmbeddedEntityInline,
  },
};

// TODO: DRY up types from embedded entry block and elsewhere
type TWO = 50;
type TwoEvent = React.KeyboardEvent & { keyCode: TWO };
type ShiftEvent = React.KeyboardEvent & { shiftKey: true };
type CtrlEvent = React.KeyboardEvent & { ctrlKey: true };
type MetaEvent = React.KeyboardEvent & { metaKey: true };
type ModEvent = CtrlEvent | MetaEvent;
type EmbeddedEntryInlineEvent = ModEvent & ShiftEvent & TwoEvent;

const isTwo = (event: React.KeyboardEvent): event is TwoEvent => event.keyCode === 50;
const isMod = (event: React.KeyboardEvent): event is ModEvent => event.ctrlKey || event.metaKey;
const isShift = (event: React.KeyboardEvent): event is ShiftEvent => event.shiftKey;
const wasEmbeddedEntryInlineEventTriggered = (
  event: React.KeyboardEvent
): event is EmbeddedEntryInlineEvent => isMod(event) && isShift(event) && isTwo(event);

function getWithEmbeddedEntryInlineEvents(sdk) {
  return function withEmbeddedEntryInlineEvents(editor) {
    return function handleEvent(event) {
      if (!editor) return;

      if (wasEmbeddedEntryInlineEventTriggered(event)) {
        selectEntityAndInsert(editor, sdk);
      }
    };
  };
}
