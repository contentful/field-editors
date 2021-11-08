import * as React from 'react';
import { css, cx } from 'emotion';
import { ScheduledAction } from '@contentful/field-editor-reference/dist/types';
import tokens from '@contentful/f36-tokens';
import { Badge, Paragraph } from '@contentful/f36-components';
import { formatDateAndTime } from '../../helpers/formatDateAndTime';

const styles = {
  // @ts-expect-error
  statusTag: css({
    marginLeft: tokens.spacingM,
    zIndex: '0 !important',
  }),
  positiveColor: css({
    color: tokens.colorPositive,
  }),
  secondaryColor: css({
    color: tokens.gray500,
  }),
  marginRightXS: css({
    marginRight: tokens.spacing2Xs,
  }),
  paragraph: css({
    textAlign: 'center',
    color: tokens.gray500,
  }),
  time: css({
    color: tokens.gray200,
  }),
};

export function ScheduleTooltipContent({
  job,
  jobsCount,
}: {
  job: ScheduledAction;
  jobsCount: number;
}) {
  let colorPalette = '';
  switch (job.action.toLowerCase()) {
    case 'publish':
      colorPalette = styles.positiveColor;
      break;
    case 'unpublish':
      colorPalette = styles.secondaryColor;
      break;
    default:
      colorPalette = styles.secondaryColor;
  }

  return (
    <>
      <span className={styles.time} data-test-id="cf-scheduled-time-tootlip-content">
        {formatDateAndTime(job.scheduledFor.datetime)}
      </span>
      <Badge
        variant={job.action === 'publish' ? 'positive' : 'secondary'}
        testId="scheduled-publish-trigger"
        className={cx(styles.statusTag, colorPalette)}>
        {job.action.toUpperCase()}
      </Badge>
      {jobsCount > 1 && <Paragraph className={styles.paragraph}>+ {jobsCount - 1} more</Paragraph>}
    </>
  );
}
