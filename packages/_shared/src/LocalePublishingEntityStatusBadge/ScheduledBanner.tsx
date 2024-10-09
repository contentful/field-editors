import React from 'react';

import { formatDateAndTime } from '@contentful/f36-components';
import type { ScheduledActionProps } from 'contentful-management';
import { orderBy } from 'lodash';

import { Banner } from './Banner';

type ScheduledBannerProps = {
  entityId: string;
  jobs: ScheduledActionProps[];
};

declare enum ScheduledActionTypes {
  publish = 'publish',
  unpublish = 'unpublish',
  'patch+publish' = 'patch+publish',
}

export function ScheduledBanner({ entityId, jobs }: ScheduledBannerProps) {
  const scheduledJobs = jobs.filter((job: ScheduledActionProps) => job.entity.sys.id === entityId);
  const sortedScheduledJobs = orderBy(scheduledJobs, ['scheduledFor.datetime'], ['asc']);
  const scheduledAction = sortedScheduledJobs[0];

  if (!scheduledAction) {
    return null;
  }

  const pendingJobsCount = scheduledJobs.length - 1;
  const lowerCaseAction = scheduledAction.action.toLowerCase();
  const action =
    lowerCaseAction === ScheduledActionTypes['patch+publish']
      ? `${lowerCaseAction} (via Schedule Series)`
      : lowerCaseAction;

  return (
    <Banner
      content={`All locales are scheduled to ${action} on:`}
      highlight={`${formatDateAndTime(scheduledAction.scheduledFor.datetime)}${
        pendingJobsCount > 0 ? ` [and +${pendingJobsCount} more]` : ''
      }`}
    />
  );
}
