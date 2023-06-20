import * as React from 'react';

import { isUnsupportedError } from '../../common/EntityStore';
import { MissingEntityCard } from '../MissingEntityCard/MissingEntityCard';
import { UnsupportedEntityCard } from './UnsupportedEntityCard';

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
