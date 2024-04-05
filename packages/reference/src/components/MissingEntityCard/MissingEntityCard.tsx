import React from 'react';

import { EntryCard, IconButton } from '@contentful/f36-components';
import { CloseIcon } from '@contentful/f36-icons';

export function MissingEntityCard(props: {
  isDisabled?: boolean;
  isSelected?: boolean;
  onRemove?: Function;
  providerName?: string;
}) {
  const providerName = props.providerName ?? 'Source';
  const description =
    props.providerName === 'Contentful'
      ? "Content was deleted or archived or you don't have access rights."
      : `Content was deleted or archived or you don't have access rights from the external provider.
      Contact your technical team.`;

  function CustomActionButton() {
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
      as="a"
      contentType={providerName}
      description={description}
      isSelected={props.isSelected}
      customActionButton={<CustomActionButton />}
    />
  );
}
