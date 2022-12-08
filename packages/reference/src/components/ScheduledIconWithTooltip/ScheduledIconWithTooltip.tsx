import React from 'react';

import { ScheduledAction } from '@contentful/app-sdk';

import { ScheduleTooltip } from './ScheduleTooltip';

type ScheduledIconWithTooltipProps = {
	getEntityScheduledActions: () => Promise<ScheduledAction[]>;
  children: React.ReactElement;
};

export const ScheduledIconWithTooltip = ({
	// getEntityScheduledActions,
  children,
}: ScheduledIconWithTooltipProps) => {

  const [status, setStatus] = React.useState<
    | { type: 'loading' }
    | { type: 'error'; error: Error }
    | { type: 'loaded'; jobs: ScheduledAction[] }
  >({ type: 'loading' });

  React.useEffect(() => {
    // getEntityScheduledActions()
    //   .then((data) => {
    //     setStatus({ type: 'loaded', jobs: data });
    //   })
    //   .catch((e) => {
    //     setStatus({ type: 'error', error: e });
    //   });
		setStatus({ type: 'loaded', jobs: [] });
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
