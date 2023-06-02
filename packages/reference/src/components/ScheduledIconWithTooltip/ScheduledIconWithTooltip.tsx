import * as React from 'react';

import { ScheduledAction, SpaceAPI } from '@contentful/app-sdk';

import { ScheduleTooltip } from './ScheduleTooltip';

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

  if (status.type === 'loading' || status.type === 'error') {
    return null;
  }

  const jobs = status.jobs ?? [];

  if (jobs.length === 0) {
    return null;
  }

  const mostRelevantJob = jobs[0];

  return (
    <ScheduleTooltip job={mostRelevantJob} jobsCount={jobs.length}>
      {children}
    </ScheduleTooltip>
  );
};
