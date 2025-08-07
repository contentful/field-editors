import * as React from 'react';

import { t } from '@lingui/core/macro';

import { MissingEntityCard } from '../MissingEntityCard/MissingEntityCard';

type UnsupportedEntityCardProps = {
  isSelected?: boolean;
  onRemove?: Function;
};

export function UnsupportedEntityCard(props: UnsupportedEntityCardProps) {
  return (
    <MissingEntityCard
      customMessage={t({
        id: 'FieldEditors.Reference.UnsupportedEntityCard.Message',
        message: 'Unsupported API information',
      })}
      isSelected={props.isSelected}
      onRemove={props.onRemove}
    />
  );
}
