import React from 'react';

import { FieldExtensionSDK } from '@contentful/app-sdk';
import { Badge, Flex, Icon, Menu } from '@contentful/f36-components';
import { EmbeddedEntryBlockIcon } from '@contentful/f36-icons';
import { BLOCKS } from '@contentful/rich-text-types';
import { css } from 'emotion';

import { useContentfulEditor } from '../../ContentfulEditorProvider';
import { useSdkContext } from '../../SdkProvider';
import { selectEntityAndInsert } from './Util';

export const styles = {
  icon: css({
    marginRight: '10px',
  }),
};

interface EmbeddedResourceBlockToolbarIconProps {
  isDisabled: boolean;
  onClose: () => void;
}

export function EmbeddedResourceBlockToolbarIcon({
  isDisabled,
  onClose,
}: EmbeddedResourceBlockToolbarIconProps) {
  const nodeType = BLOCKS.EMBEDDED_RESOURCE;
  const editor = useContentfulEditor();
  const sdk: FieldExtensionSDK = useSdkContext();

  const handleClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    if (!editor) {
      return;
    }

    onClose();
    await selectEntityAndInsert(sdk, editor, editor.tracking.onToolbarAction);
  };

  const baseClass = `rich-text__${nodeType}`;
  return (
    <Menu.Item
      disabled={isDisabled}
      className={`${baseClass}-list-item`}
      onClick={handleClick}
      testId={`toolbar-toggle-${nodeType}`}
    >
      <Flex alignItems="center" flexDirection="row">
        <Icon
          as={EmbeddedEntryBlockIcon}
          className={`rich-text__embedded-entry-list-icon ${styles.icon}`}
          variant="secondary"
        />
        <span>
          Entry (different space){' '}
          <Badge variant="primary-filled" size="small">
            new
          </Badge>
        </span>
      </Flex>
    </Menu.Item>
  );
}
