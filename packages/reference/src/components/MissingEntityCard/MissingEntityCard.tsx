import React, { ReactNode } from 'react';

import { EntryCard, IconButton } from '@contentful/f36-components';
import { CloseIcon } from '@contentful/f36-icons';
import { t } from '@lingui/core/macro';

type MissingEntityCardProps = {
  customMessage?: string;
  isDisabled?: boolean;
  isSelected?: boolean;
  onRemove?: Function;
  providerName?: string;
  as?: 'a' | 'article' | 'button' | 'div' | 'fieldset';
  testId?: string;
  children?: ReactNode;
};

export function MissingEntityCard({
  as = 'a',
  providerName = 'Source',
  customMessage,
  isDisabled,
  isSelected,
  onRemove,
  testId = 'cf-ui-missing-entity-card',
  children,
}: MissingEntityCardProps) {
  const description =
    customMessage ??
    t({
      id: 'FieldEditors.Reference.MissingEntityCard.DefaultMessage',
      message: 'Content missing or inaccessible',
    });

  function CustomActionButton() {
    if (isDisabled || !onRemove) return null;

    return (
      <IconButton
        aria-label="Actions"
        icon={<CloseIcon variant="muted" />}
        size="small"
        variant="transparent"
        onClick={() => {
          onRemove && onRemove();
        }}
      />
    );
  }

  return (
    <EntryCard
      as={as}
      contentType={providerName}
      description={description}
      isSelected={isSelected}
      customActionButton={<CustomActionButton />}
      testId={testId}
    >
      {children}
    </EntryCard>
  );
}
