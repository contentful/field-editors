import React from 'react';
import get from 'lodash/get';
import { css } from 'emotion';
import { ContentType } from '../../types';
import { Icon, TextLink, Spinner } from '@contentful/forma-36-react-components';
import tokens from '@contentful/forma-36-tokens';
import { CreateEntryMenuTrigger, CreateCustomEntryMenuItems } from './CreateEntryMenuTrigger';

const standardStyles = {
  chevronIcon: css({
    float: 'right',
    marginLeft: tokens.spacingXs,
    marginRight: -tokens.spacing2Xs,
  }),
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
  hasPlusIcon: boolean;
  useExperimentalStyles?: boolean;
  text?: string;
  testId?: string;
  dropdownSettings?: {
    isAutoalignmentEnabled: boolean;
    position: 'bottom-left' | 'bottom-right';
  };
}

export const CreateEntryLinkButton = ({
  contentTypes,
  onSelect,
  renderCustomDropdownItems,
  text,
  testId,
  hasPlusIcon,
  useExperimentalStyles,
  suggestedContentTypeId,
  dropdownSettings,
  disabled,
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
  const plusIcon = !hasPlusIcon ? undefined : useExperimentalStyles ? 'PlusCircle' : 'Plus';
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
          <TextLink
            key="textLink"
            onClick={() => {
              openMenu();
            }}
            disabled={disabled || isSelecting || (contentTypes && contentTypes.length === 0)}
            icon={isSelecting ? undefined : plusIcon}
            className={styles.action}
            testId="create-entry-link-button">
            {buttonText}
            {hasDropdown && (
              <Icon
                data-test-id="dropdown-icon"
                icon="ChevronDown"
                color="secondary"
                className={styles.chevronIcon}
              />
            )}
          </TextLink>
        </>
      )}
    </CreateEntryMenuTrigger>
  );
};

CreateEntryLinkButton.defaultProps = {
  hasPlusIcon: false,
  disabled: false,
};
