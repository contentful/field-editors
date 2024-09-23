import * as React from 'react';

import { ScheduledAction, SpaceAPI } from '@contentful/app-sdk';

import { ScheduleTooltip } from './ScheduleTooltip';

export type UseScheduledActionsProps = Pick<
  ScheduledIconWithTooltipProps,
  'entityId' | 'entityType' | 'getEntityScheduledActions'
>;

export function useScheduledActions({
  getEntityScheduledActions,
  entityId,
  entityType,
}: UseScheduledActionsProps) {
  const [status, setStatus] = React.useState<
    | { type: 'loading' }
    | { type: 'error'; error: Error }
    | { type: 'loaded'; jobs: ScheduledAction[] }
  >({ type: 'loading' });

  React.useEffect(() => {
    getEntityScheduledActions(entityType, entityId)
      .then((data) => {
        setStatus({ type: 'loaded', jobs: data });
      })
      .catch((e) => {
        setStatus({ type: 'error', error: e });
      });
    // This should only be ever called once. Following the eslint hint to add used
    // dependencies will cause page freeze (infinite loop)
    // eslint-disable-next-line -- TODO: describe this disable
  }, []);

  if (status.type === 'loading') {
    return { isLoading: true, isError: false, jobs: [] };
  }

  if (status.type === 'error') {
    return { isLoading: false, isError: true, jobs: [] };
  }

  return {
    isLoading: false,
    isError: false,
    jobs: status.jobs || [],
  };
}

type ScheduledIconWithTooltipProps = {
  getEntityScheduledActions: SpaceAPI['getEntityScheduledActions'];
  entityType: 'Entry' | 'Asset';
  entityId: string;
  children: React.ReactElement;
};

export const ScheduledIconWithTooltip = ({
  entityType,
  entityId,
  getEntityScheduledActions,
  children,
}: ScheduledIconWithTooltipProps) => {
  const { isError, isLoading, jobs } = useScheduledActions({
    entityType,
    entityId,
    getEntityScheduledActions,
  });

  if (isLoading || isError) {
    return children;
  }

  if (jobs.length === 0) {
    return null;
  }

  return (
    <ScheduleTooltip job={jobs[0]} jobsCount={jobs.length}>
      {children}
    </ScheduleTooltip>
  );
};
