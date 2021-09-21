import React from 'react';
import { DropdownListItem, Button, Flex, Icon } from '@contentful/forma-36-react-components';
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

  const handleClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();

    onClose();
    await selectEntityAndInsert(nodeType, sdk, editor, logAction || noop);
  };

  const type = getEntityTypeFromNodeType(nodeType);
  const baseClass = `rich-text__${nodeType}`;
  return isButton ? (
    <Button
      disabled={isDisabled}
      className={`${baseClass}-button`}
      size="small"
      // @ts-expect-error
      onMouseDown={handleClick}
      icon={type === 'Asset' ? 'Asset' : 'EmbeddedEntryBlock'}
      buttonType="muted"
      testId={`toolbar-toggle-${nodeType}`}>
      {`Embed ${type.toLowerCase()}`}
    </Button>
  ) : (
    <DropdownListItem
      isDisabled={isDisabled}
      className={`${baseClass}-list-item`}
      onMouseDown={handleClick}
      testId={`toolbar-toggle-${nodeType}`}>
      <Flex alignItems="center" flexDirection="row">
        <Icon
          icon={type === 'Asset' ? 'Asset' : 'EmbeddedEntryBlock'}
          className={`rich-text__embedded-entry-list-icon ${styles.icon}`}
          color="secondary"
        />
        <span>{type}</span>
      </Flex>
    </DropdownListItem>
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
