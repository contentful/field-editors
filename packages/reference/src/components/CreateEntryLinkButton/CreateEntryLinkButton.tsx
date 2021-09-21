import React from 'react';
import get from 'lodash/get';
import { css } from 'emotion';
import { ContentType } from '../../types';
import tokens from '@contentful/forma-36-tokens';
import { CreateEntryMenuTrigger, CreateCustomEntryMenuItems } from './CreateEntryMenuTrigger';

import { Spinner, Button } from '@contentful/f36-components';

import { ChevronDownIcon, PlusIcon } from '@contentful/f36-icons';

const standardStyles = {
  spinnerMargin: css({
    marginRight: tokens.spacingXs,
  }),
  action: undefined,
};
const redesignStyles = {
  ...standardStyles,
  action: css({
    textDecoration: 'none',
    fontWeight: 'bold',
  }),
};

interface CreateEntryLinkButtonProps {
  contentTypes: ContentType[];
  suggestedContentTypeId?: string;
  onSelect: (contentTypeId: string) => Promise<unknown>;
  renderCustomDropdownItems?: CreateCustomEntryMenuItems;
  disabled?: boolean;
  hasPlusIcon?: boolean;
  useExperimentalStyles?: boolean;
  text?: string | React.ReactElement;
  testId?: string;
  dropdownSettings?: {
    isAutoalignmentEnabled?: boolean;
    position: 'bottom-left' | 'bottom-right';
  };
}

export const CreateEntryLinkButton = ({
  contentTypes,
  onSelect,
  renderCustomDropdownItems,
  text,
  testId,
  hasPlusIcon = false,
  useExperimentalStyles,
  suggestedContentTypeId,
  dropdownSettings,
  disabled = false,
}: CreateEntryLinkButtonProps) => {
  const suggestedContentType = contentTypes.find((ct) => ct.sys.id === suggestedContentTypeId);
  const buttonText =
    text ||
    `Add ${get(
      suggestedContentType || (contentTypes.length === 1 ? contentTypes[0] : {}),
      'name',
      'entry'
    )}`;
  const hasDropdown = contentTypes.length > 1 || renderCustomDropdownItems;

  // TODO: Introduce `icon: string` and remove `hasPlusIcon` or remove "Plus" if we keep new layout.
  const plusIcon = hasPlusIcon ? <PlusIcon /> : undefined;
  // TODO: Always use "New content" here if we fully switch to new layout.
  const contentTypesLabel = useExperimentalStyles ? 'New content' : undefined;
  const styles = useExperimentalStyles ? redesignStyles : standardStyles;

  return (
    <CreateEntryMenuTrigger
      contentTypes={contentTypes}
      suggestedContentTypeId={suggestedContentTypeId}
      contentTypesLabel={contentTypesLabel}
      onSelect={onSelect}
      testId={testId}
      dropdownSettings={dropdownSettings}
      renderCustomDropdownItems={renderCustomDropdownItems}>
      {({ openMenu, isSelecting }) => (
        <>
          {isSelecting && <Spinner size="small" key="spinner" className={styles.spinnerMargin} />}
          <Button
            endIcon={hasDropdown ? <ChevronDownIcon /> : undefined}
            variant="secondary"
            onClick={() => {
              openMenu();
            }}
            className={styles.action}
            isDisabled={disabled || isSelecting || (contentTypes && contentTypes.length === 0)}
            startIcon={isSelecting ? undefined : plusIcon}
            size="small"
            testId="create-entry-link-button">
            {buttonText}
          </Button>
        </>
      )}
    </CreateEntryMenuTrigger>
  );
};
