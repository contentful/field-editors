import * as React from 'react';

import { isFunctionInvocationError, isUnsupportedError } from '../../common/EntityStore';
import { getProviderName } from '../../utils/getProviderName';
import { MissingEntityCard } from '../MissingEntityCard/MissingEntityCard';
import { FunctionInvocationErrorCard } from './FunctionInvocationErrorCard';
import { UnsupportedEntityCard } from './UnsupportedEntityCard';

type ResourceEntityErrorCardProps = {
  linkType: string;
  error: unknown;
  isSelected?: boolean;
  isDisabled: boolean;
  onRemove?: Function;
};

export function ResourceEntityErrorCard(props: ResourceEntityErrorCardProps) {
  if (isUnsupportedError(props.error)) {
    return <UnsupportedEntityCard isSelected={props.isSelected} onRemove={props.onRemove} />;
  }

  const providerName = getProviderName(props.linkType);

  if (isFunctionInvocationError(props.error)) {
    return (
      <FunctionInvocationErrorCard
        isSelected={props.isSelected}
        isDisabled={props.isDisabled}
        organizationId={props.error.organizationId}
        appDefinitionId={props.error.appDefinitionId}
        onRemove={props.onRemove}
        providerName={providerName}
      />
    );
  }

  return (
    <MissingEntityCard
      isDisabled={props.isDisabled}
      isSelected={props.isSelected}
      onRemove={props.onRemove}
      providerName={providerName}
    />
  );
}
