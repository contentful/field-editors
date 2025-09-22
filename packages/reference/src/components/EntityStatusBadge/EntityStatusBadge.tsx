import React from 'react';

import { EntityStatusBadge as StatusBadge, type EntityStatus } from '@contentful/f36-components';
import {
  LocalePublishingPopover,
  LocalePublishStatusMap,
  ReleaseEntityStatusPopover,
  ReleaseEntityStatusBadge,
  type ReleaseAction,
  type ReleaseStatusMap,
  type ReleaseV2Props,
} from '@contentful/field-editor-shared';
import { EntryProps, LocaleProps, AssetProps } from 'contentful-management';

import {
  useScheduledActions,
  type UseScheduledActionsProps,
} from '../ScheduledIconWithTooltip/ScheduledIconWithTooltip';
import { ScheduleTooltip } from '../ScheduledIconWithTooltip/ScheduleTooltip';

type EntityStatusBadgeProps = Omit<UseScheduledActionsProps, 'entityId'> & {
  status: EntityStatus;
  entity: EntryProps | AssetProps;
  useLocalizedEntityStatus?: boolean;
  localesStatusMap?: LocalePublishStatusMap;
  activeLocales?: Pick<LocaleProps, 'code'>[];
  releaseStatusMap?: ReleaseStatusMap;
  releaseAction?: ReleaseAction;
  release?: ReleaseV2Props;
};

export function EntityStatusBadge({
  entityType,
  getEntityScheduledActions,
  status,
  useLocalizedEntityStatus,
  localesStatusMap,
  activeLocales,
  entity,
  releaseStatusMap,
  releaseAction,
  release,
  ...props
}: EntityStatusBadgeProps) {
  const { isError, isLoading, jobs } = useScheduledActions({
    entityId: entity.sys.id,
    entityType,
    getEntityScheduledActions,
  });

  // release entry + locale based publishing
  if (release && releaseStatusMap && useLocalizedEntityStatus && activeLocales) {
    return (
      <ReleaseEntityStatusPopover
        releaseStatusMap={releaseStatusMap}
        activeLocales={activeLocales}
      />
    );
  }

  // release entry + entry based publishing
  if (release && releaseAction) {
    return <ReleaseEntityStatusBadge action={releaseAction} />;
  }

  // current base entry + locale based publishing
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

  // current base entry + entry based publishing
  if (isError || isLoading || jobs.length === 0) {
    return <StatusBadge {...props} entityStatus={status} />;
  }

  return (
    <ScheduleTooltip job={jobs[0]} jobsCount={jobs.length}>
      <StatusBadge {...props} entityStatus={status} isScheduled />
    </ScheduleTooltip>
  );
}
