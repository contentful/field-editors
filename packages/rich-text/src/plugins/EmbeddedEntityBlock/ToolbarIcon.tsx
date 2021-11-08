import React from 'react';
import { Flex, Icon, Button, Menu } from '@contentful/f36-components';

import { AssetIcon, EmbeddedEntryBlockIcon } from '@contentful/f36-icons';
import { selectEntityAndInsert } from './Util';
import noop from 'lodash/noop';
import { FieldExtensionSDK } from '@contentful/app-sdk';
import { useSdkContext } from '../../SdkProvider';
import { css } from 'emotion';
import { useContentfulEditor } from '../../ContentfulEditorProvider';

export const styles = {
  icon: css({
    marginRight: '10px',
  }),
};

interface EmbeddedEntityBlockToolbarIconProps {
  isButton?: boolean;
  isDisabled: boolean;
  logAction?: () => void;
  nodeType: string;
  onClose: () => void;
}

export function EmbeddedEntityBlockToolbarIcon({
  isButton,
  isDisabled,
  logAction,
  nodeType,
  onClose,
}: EmbeddedEntityBlockToolbarIconProps) {
  const editor = useContentfulEditor();
  const sdk: FieldExtensionSDK = useSdkContext();

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();

    onClose();
    selectEntityAndInsert(nodeType, sdk, editor, logAction || noop);
  };

  const type = getEntityTypeFromNodeType(nodeType);
  const baseClass = `rich-text__${nodeType}`;
  return isButton ? (
    <Button
      isDisabled={isDisabled}
      className={`${baseClass}-button`}
      size="small"
      onClick={handleClick}
      startIcon={type === 'Asset' ? <AssetIcon /> : <EmbeddedEntryBlockIcon />}
      variant="secondary"
      testId={`toolbar-toggle-${nodeType}`}>
      {`Embed ${type.toLowerCase()}`}
    </Button>
  ) : (
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
