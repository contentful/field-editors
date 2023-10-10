import * as React from 'react';

import { FieldAppSDK } from '@contentful/app-sdk';
import { Menu, Flex } from '@contentful/f36-components';
import { EmbeddedEntryInlineIcon } from '@contentful/f36-icons';
import tokens from '@contentful/f36-tokens';
import { INLINES } from '@contentful/rich-text-types';
import { css } from 'emotion';

import { useContentfulEditor } from '../../ContentfulEditorProvider';
import { moveToTheNextChar } from '../../helpers/editor';
import { useSdkContext } from '../../SdkProvider';
import { selectEntityAndInsert } from '../shared/EmbeddedInlineUtil';

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

interface EmbeddedInlineToolbarIconProps {
  onClose: () => void;
  isDisabled: boolean;
}

export function EmbeddedInlineToolbarIcon(props: EmbeddedInlineToolbarIconProps) {
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
