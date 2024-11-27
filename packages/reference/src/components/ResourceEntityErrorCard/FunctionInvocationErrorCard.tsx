import * as React from 'react';

import { Flex, Text, TextLink } from '@contentful/f36-components';

import { MissingEntityCard } from '..';

import { ErrorCircleOutlineIcon, ExternalLinkIcon } from '@contentful/f36-icons';

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
    <Text fontColor="colorNegative">
      &nbsp;For more information, go to&nbsp;
      <TextLink icon={<ExternalLinkIcon />} alignIcon="end" href={functionLink}>
        function logs
      </TextLink>
    </Text>
  );

  return (
    <Flex justifyContent="left" alignItems="center">
      <ErrorCircleOutlineIcon variant="negative" />
      <Text fontColor="colorNegative">&nbsp;Function invocation error.</Text>
      {props.status === 'success' && props.functionId && children}
    </Flex>
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
      customMessage={''}
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
