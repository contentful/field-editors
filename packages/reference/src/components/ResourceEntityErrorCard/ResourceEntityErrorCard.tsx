import * as React from 'react';

import { isUnsupportedError } from '../../common/EntityStore';
import { getProviderName } from '../../utils/getProviderName';
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

  const providerName = getProviderName(props.linkType);

  return (
    <MissingEntityCard
      isDisabled={props.isDisabled}
      isSelected={props.isSelected}
      onRemove={props.onRemove}
      providerName={providerName}
    />
  );
}
