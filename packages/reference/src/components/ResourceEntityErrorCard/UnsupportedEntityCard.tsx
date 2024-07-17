import * as React from 'react';

import { MissingEntityCard } from '../MissingEntityCard/MissingEntityCard';

type UnsupportedEntityCardProps = {
  isSelected?: boolean;
  onRemove?: Function;
};

export function UnsupportedEntityCard(props: UnsupportedEntityCardProps) {
  return (
    <MissingEntityCard
      customMessage="Unsupported API information"
      isSelected={props.isSelected}
      onRemove={props.onRemove}
    />
  );
}
