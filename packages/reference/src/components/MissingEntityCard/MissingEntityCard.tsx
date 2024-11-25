import React, { ReactNode } from 'react';

import { EntryCard, IconButton } from '@contentful/f36-components';
import { CloseIcon } from '@contentful/f36-icons';

type MissingEntityCardProps = {
  customMessage?: string;
  isDisabled?: boolean;
  isSelected?: boolean;
  onRemove?: Function;
  providerName?: string;
  as?: 'a' | 'article' | 'button' | 'div' | 'fieldset';
  children?: ReactNode;
};

export function MissingEntityCard(props: MissingEntityCardProps) {
  const as = props.as || 'a';
  const providerName = props.providerName ?? 'Source';
  const description = props.customMessage ?? undefined;

  function CustomActionButton() {
    if (props.isDisabled || !props.onRemove) return null;

    return (
      <IconButton
        aria-label="Actions"
        icon={<CloseIcon variant="muted" />}
        size="small"
        variant="transparent"
        onClick={() => {
          props.onRemove && props.onRemove();
        }}
      />
    );
  }

  return (
    <EntryCard
      as={as}
      contentType={providerName}
      description={description}
      isSelected={props.isSelected}
      customActionButton={<CustomActionButton />}
      testId="cf-ui-missing-entity-card"
    >
      {props.children}
    </EntryCard>
  );
}
