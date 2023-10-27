import * as React from 'react';

import { ScheduledAction } from '@contentful/app-sdk';
import { Tooltip } from '@contentful/f36-tooltip';

import { formatDateAndTime } from './formatDateAndTime.js';

export const getScheduleTooltipContent = ({
  job,
  jobsCount,
}: {
  job: ScheduledAction;
  jobsCount: number;
}) => {
  return `Will ${job.action.toLowerCase()} ${formatDateAndTime(
    job.scheduledFor.datetime
  ).toLowerCase()}
  ${jobsCount > 1 ? `+ ${jobsCount - 1} more` : ''}`;
};

export const ScheduleTooltip = ({
  job,
  jobsCount,
  children,
}: {
  job: ScheduledAction;
  jobsCount: number;
  children: React.ReactElement;
}) => {
  return (
    <Tooltip
      placement="top"
      testId={job.sys.id}
      as="div"
      content={getScheduleTooltipContent({ job, jobsCount })}>
      {children}
    </Tooltip>
  );
};
