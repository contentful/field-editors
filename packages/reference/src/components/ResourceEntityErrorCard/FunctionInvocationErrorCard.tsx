import * as React from 'react';

import { Flex, Text, TextLink } from '@contentful/f36-components';
import { ErrorCircleOutlineIcon, ExternalLinkIcon } from '@contentful/f36-icons';
import { t } from '@lingui/core/macro';

import { MissingEntityCard } from '..';

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
        <Text fontColor="colorNegative">
          &nbsp;
          {t({
            id: 'FieldEditors.Reference.FunctionInvocationErrorCard.ErrorMessage',
            message: 'Function invocation error.',
          })}
        </Text>
        {status === 'success' && functionId && (
          <Text fontColor="colorNegative">
            &nbsp;
            {t({
              id: 'FieldEditors.Reference.FunctionInvocationErrorCard.LogsInfo',
              message: 'For more information, go to',
            })}
            &nbsp;
            <TextLink
              testId="cf-ui-function-invocation-log-link"
              icon={<ExternalLinkIcon />}
              target="_blank"
              alignIcon="end"
              href={functionLink}
            >
              {t({
                id: 'FieldEditors.Reference.FunctionInvocationErrorCard.FunctionLogs',
                message: 'function logs',
              })}
            </TextLink>
          </Text>
        )}
      </Flex>
    </MissingEntityCard>
  );
}
