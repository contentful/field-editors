import React from 'react';
import { ScheduledAction } from 'contentful-ui-extensions-sdk';
import { css, cx } from 'emotion';
import { Tag, Tooltip, Paragraph } from '@contentful/forma-36-react-components';
import tokens from '@contentful/forma-36-tokens';
import { formatDateAndTime } from './formatDateAndTime';

const styles = {
  // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
  // @ts-ignore
  statusTag: css({
    marginLeft: tokens.spacingM,
    zIndex: '0 !important',
  }),
  positiveColor: css({
    color: tokens.colorPositive,
  }),
  secondaryColor: css({
    color: tokens.colorElementDarkest,
  }),
  marginRightXS: css({
    marginRight: tokens.spacing2Xs,
  }),
  paragraph: css({
    textAlign: 'center',
    color: tokens.colorElementDarkest,
  }),
  time: css({
    color: tokens.colorElementLight,
  }),
};

export const ScheduleTooltipContent = ({
  job,
  jobsCount,
}: {
  job: ScheduledAction;
  jobsCount: number;
}) => {
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
      <Tag
        tagType={job.action === 'publish' ? 'positive' : 'secondary'}
        testId="scheduled-publish-trigger"
        className={cx(styles.statusTag, colorPalette)}>
        {job.action.toUpperCase()}
      </Tag>
      {jobsCount > 1 && <Paragraph className={styles.paragraph}>+ {jobsCount - 1} more</Paragraph>}
    </>
  );
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
      place="top"
      testId={job.sys.id}
      containerElement="div"
      content={<ScheduleTooltipContent job={job} jobsCount={jobsCount} />}>
      {children}
    </Tooltip>
  );
};
