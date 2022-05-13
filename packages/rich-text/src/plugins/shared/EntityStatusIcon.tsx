import * as React from 'react';

import { ClockIcon } from '@contentful/f36-icons';
import tokens from '@contentful/f36-tokens';
import { useEntities, ScheduledIconWithTooltip } from '@contentful/field-editor-reference';
import { Entry, Asset } from '@contentful/field-editor-shared';
import { css } from 'emotion';

const styles = {
  scheduleIcon: css({
    marginRight: tokens.spacing2Xs,
  }),
};

interface EntityStatusIconProps {
  entity: Entry | Asset;
  entityType: 'Entry' | 'Asset';
}

export function EntityStatusIcon({ entity, entityType }: EntityStatusIconProps) {
  const { loadEntityScheduledActions } = useEntities();

  return (
    <ScheduledIconWithTooltip
      getEntityScheduledActions={loadEntityScheduledActions}
      entityType={entityType}
      entityId={entity.sys.id}>
      <ClockIcon
        className={styles.scheduleIcon}
        size="small"
        color="muted"
        testId="schedule-icon"
      />
    </ScheduledIconWithTooltip>
  );
}
