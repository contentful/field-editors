import * as React from 'react';
import {
  SlatePlugin,
  getRenderElement,
  getSlatePluginTypes,
  useStoreEditor,
} from '@udecode/slate-plugins-core';
import { Transforms, Element } from 'slate';
import { INLINES } from '@contentful/rich-text-types';
import { RenderElementProps, useSelected, ReactEditor, useReadOnly } from 'slate-react';
import { Button, DropdownListItem, Icon, Flex } from '@contentful/forma-36-react-components';
import { css } from 'emotion';
import { FieldExtensionSDK, Entry, Link } from '@contentful/field-editor-reference/dist/types';
import { CustomSlatePluginOptions } from '../../types';
import newEntitySelectorConfigFromRichTextField from '../../helpers/newEntitySelectorConfigFromRichTextField';
import { useSdkContext } from '../../SdkProvider';
import { FetchingWrappedInlineEntryCard } from './FetchingWrappedInlineEntryCard';

const styles = {
  icon: css({
    marginRight: '10px',
  }),

  root: css({
    margin: '0px 5px',
    fontSize: 'inherit',
    span: {
      webkitUserSelect: 'none',
      mozUserSelect: 'none',
      msUserSelect: 'none',
      userSelect: 'none',
    },
  }),
};

interface EmbeddedEntityInlineProps extends RenderElementProps {
  element: Element & {
    data: {
      target: Link;
    };
    type: string;
    isVoid: boolean;
  };
}

function EmbeddedEntityInline(props: EmbeddedEntityInlineProps) {
  const editor = useStoreEditor();
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
    <span {...props.attributes} className={styles.root}>
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

export function ToolbarEmbeddedEntityInlineButton(props: ToolbarEmbeddedEntityInlineButtonProps) {
  const editor = useStoreEditor();
  const sdk: FieldExtensionSDK = useSdkContext();

  async function handleClick(event) {
    event.preventDefault();

    if (!editor) return;

    props.onClose();

    const config = {
      ...newEntitySelectorConfigFromRichTextField(sdk.field, INLINES.EMBEDDED_ENTRY),
      withCreate: true,
    };
    const entry = await sdk.dialogs.selectSingleEntry<Entry>(config);
    if (!entry) return;

    const inlineEntryNode = {
      type: INLINES.EMBEDDED_ENTRY,
      children: [{ text: '' }],
      data: {
        target: {
          sys: {
            id: entry.sys.id,
            type: 'Link',
            linkType: 'Entry',
          },
        },
      },
    };

    Transforms.insertNodes(editor, inlineEntryNode);
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

export function createEmbeddedEntityInlinePlugin(): SlatePlugin {
  return {
    renderElement: getRenderElement(INLINES.EMBEDDED_ENTRY),
    pluginKeys: INLINES.EMBEDDED_ENTRY,
    inlineTypes: getSlatePluginTypes(INLINES.EMBEDDED_ENTRY),
  };
}

export const withEmbeddedEntityInlineOptions: CustomSlatePluginOptions = {
  [INLINES.EMBEDDED_ENTRY]: {
    type: INLINES.EMBEDDED_ENTRY,
    component: EmbeddedEntityInline,
  },
};
