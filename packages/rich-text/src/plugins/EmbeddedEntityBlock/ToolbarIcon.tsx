import React from 'react';

import { FieldExtensionSDK } from '@contentful/app-sdk';
import { Flex, Icon, Menu } from '@contentful/f36-components';
import { AssetIcon, EmbeddedEntryBlockIcon } from '@contentful/f36-icons';
import { css } from 'emotion';

import { useContentfulEditor } from '../../ContentfulEditorProvider';
import { useSdkContext } from '../../SdkProvider';
import { selectEntityAndInsert } from './Util';

export const styles = {
  icon: css({
    marginRight: '10px',
  }),
};

interface EmbeddedEntityBlockToolbarIconProps {
  isDisabled: boolean;
  nodeType: string;
  onClose: () => void;
}

export function EmbeddedEntityBlockToolbarIcon({
  isDisabled,
  nodeType,
  onClose,
}: EmbeddedEntityBlockToolbarIconProps) {
  const editor = useContentfulEditor();
  const sdk: FieldExtensionSDK = useSdkContext();

  const handleClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();

    onClose();
    await selectEntityAndInsert(nodeType, sdk, editor, editor.tracking.onToolbarAction);
  };

  const type = getEntityTypeFromNodeType(nodeType);
  const baseClass = `rich-text__${nodeType}`;
  return (
    <Menu.Item
      disabled={isDisabled}
      className={`${baseClass}-list-item`}
      onClick={handleClick}
      testId={`toolbar-toggle-${nodeType}`}>
      <Flex alignItems="center" flexDirection="row">
        <Icon
          as={type === 'Asset' ? AssetIcon : EmbeddedEntryBlockIcon}
          className={`rich-text__embedded-entry-list-icon ${styles.icon}`}
          variant="secondary"
        />
        <span>{type}</span>
      </Flex>
    </Menu.Item>
  );
}

function getEntityTypeFromNodeType(nodeType: string): string | never {
  const words = nodeType.toLowerCase().split('-');
  if (words.includes('entry')) {
    return 'Entry';
  }
  if (words.includes('asset')) {
    return 'Asset';
  }
  throw new Error(`Node type \`${nodeType}\` has no associated \`entityType\``);
}
