import React from 'react';

import { EntityStatusBadge as StatusBadge, type EntityStatus } from '@contentful/f36-components';
import { LocalePublishingPopover, LocalePublishStatusMap } from '@contentful/field-editor-shared';
import { EntryProps, LocaleProps, AssetProps } from 'contentful-management';

import {
  useScheduledActions,
  type UseScheduledActionsProps,
} from '../ScheduledIconWithTooltip/ScheduledIconWithTooltip';
import { ScheduleTooltip } from '../ScheduledIconWithTooltip/ScheduleTooltip';

type EntityStatusBadgeProps = UseScheduledActionsProps & {
  status: EntityStatus;
  entity: EntryProps | AssetProps;
  useLocalizedEntityStatus?: boolean;
  localesStatusMap?: LocalePublishStatusMap;
  activeLocales?: LocaleProps[];
};

export function EntityStatusBadge({
  entityId,
  entityType,
  getEntityScheduledActions,
  status,
  useLocalizedEntityStatus,
  localesStatusMap,
  activeLocales,
  entity,
  ...props
}: EntityStatusBadgeProps) {
  const { isError, isLoading, jobs } = useScheduledActions({
    entityId,
    entityType,
    getEntityScheduledActions,
  });

  if (useLocalizedEntityStatus && activeLocales && localesStatusMap) {
    return (
      <LocalePublishingPopover
        entity={entity}
        jobs={jobs}
        isScheduled={jobs.length !== 0}
        localesStatusMap={localesStatusMap}
        activeLocales={activeLocales}
      />
    );
  }

  if (isError || isLoading || jobs.length === 0) {
    return <StatusBadge {...props} entityStatus={status} />;
  }

  return (
    <ScheduleTooltip job={jobs[0]} jobsCount={jobs.length}>
      <StatusBadge {...props} entityStatus={status} isScheduled />
    </ScheduleTooltip>
  );
}
