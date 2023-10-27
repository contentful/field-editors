import * as React from 'react';

import { isUnsupportedError } from '../../common/EntityStore.js';
import { MissingEntityCard } from '../MissingEntityCard/MissingEntityCard.js';
import { UnsupportedEntityCard } from './UnsupportedEntityCard.js';

export function ResourceEntityErrorCard(props: {
  linkType: string;
  error: unknown;
  isSelected?: boolean;
  isDisabled: boolean;
  onRemove?: Function;
}) {
  if (isUnsupportedError(props.error)) {
    return <UnsupportedEntityCard linkType={props.linkType} isSelected={props.isSelected} />;
  }

  return (
    <MissingEntityCard
      entityType="Entry"
      isDisabled={props.isDisabled}
      isSelected={props.isSelected}
      onRemove={props.onRemove}
    />
  );
}
