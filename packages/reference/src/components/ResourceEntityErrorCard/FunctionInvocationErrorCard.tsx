import * as React from 'react';

import { Note, TextLink } from '@contentful/f36-components';

import { MissingEntityCard } from '..';

import { ExternalLinkIcon } from '@contentful/f36-icons';

import { useResourceProvider } from '../../common/EntityStore';

type FunctionInvocationErrorLogLinkProps = {
  organizationId: string;
  appDefinitionId: string;
  functionId?: string;
  status: 'error' | 'success' | 'loading';
};

function FunctionInvocationErrorLogLink(props: FunctionInvocationErrorLogLinkProps) {
  const functionLink = `/account/organizations/${props.organizationId}/apps/definitions/${props.appDefinitionId}/functions/${props.functionId}/logs`;

  const children = (
    <>
      {'See '}
      <TextLink icon={<ExternalLinkIcon />} alignIcon="end" href={functionLink}>
        function logs
      </TextLink>
      {' for more info'}
    </>
  );

  return (
    <Note title="Function Invocation Error" variant="negative">
      {props.status === 'success' && props.functionId && children}
    </Note>
  );
}

type FunctionInvocationErrorCardProps = {
  isSelected?: boolean;
  isDisabled?: boolean;
  organizationId: string;
  appDefinitionId: string;
  onRemove?: Function;
  providerName?: string;
};

export function FunctionInvocationErrorCard(props: FunctionInvocationErrorCardProps) {
  const providerName = props.providerName ?? 'Source';

  const { status, data } = useResourceProvider(props.organizationId, props.appDefinitionId);

  return (
    <MissingEntityCard
      as="div"
      providerName={providerName}
      isDisabled={props.isDisabled}
      isSelected={props.isSelected}
      onRemove={props.onRemove}
    >
      <FunctionInvocationErrorLogLink
        organizationId={props.organizationId}
        appDefinitionId={props.appDefinitionId}
        functionId={data?.function.sys.id}
        status={status}
      />
    </MissingEntityCard>
  );
}
