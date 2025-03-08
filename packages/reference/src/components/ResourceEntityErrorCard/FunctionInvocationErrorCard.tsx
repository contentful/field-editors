import * as React from 'react';

import { Flex, Text, TextLink } from '@contentful/f36-components';

import { MissingEntityCard } from '..';

import { ErrorCircleOutlineIcon, ExternalLinkIcon } from '@contentful/f36-icons';

import { useResourceProvider } from '../../common/EntityStore';

type FunctionInvocationErrorCardProps = {
  isSelected?: boolean;
  isDisabled?: boolean;
  organizationId: string;
  appDefinitionId: string;
  onRemove?: Function;
  providerName?: string;
};

export function FunctionInvocationErrorCard({
  providerName = 'Source',
  organizationId,
  appDefinitionId,
  isDisabled,
  isSelected,
  onRemove,
}: FunctionInvocationErrorCardProps) {
  const { status, data } = useResourceProvider(organizationId, appDefinitionId);

  const functionId = data?.function.sys.id;
  const functionLink = `/account/organizations/${organizationId}/apps/definitions/${appDefinitionId}/functions/${functionId}/logs`;

  return (
    <MissingEntityCard
      as="div"
      providerName={providerName}
      isDisabled={isDisabled}
      isSelected={isSelected}
      onRemove={onRemove}
      customMessage={''}
      testId="cf-ui-function-invocation-error-card"
    >
      <Flex justifyContent="left" alignItems="center">
        <ErrorCircleOutlineIcon variant="negative" />
        <Text fontColor="colorNegative">&nbsp;Function invocation error.</Text>
        {status === 'success' && functionId && (
          <Text fontColor="colorNegative">
            &nbsp;For more information, go to&nbsp;
            <TextLink
              testId="cf-ui-function-invocation-log-link"
              icon={<ExternalLinkIcon />}
              target="_blank"
              alignIcon="end"
              href={functionLink}
            >
              function logs
            </TextLink>
          </Text>
        )}
      </Flex>
    </MissingEntityCard>
  );
}
