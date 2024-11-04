import React from 'react';

import { EntityStatusBadge, Text } from '@contentful/f36-components';
import tokens from '@contentful/f36-tokens';
import type { LocaleProps } from 'contentful-management';
import { css } from 'emotion';

const styles = {
  locale: css({
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
  }),
  status: css({
    flexShrink: 0,
  }),
  localePublishStatus: css({
    display: 'flex',
    gap: tokens.spacingXs,
    justifyContent: 'space-between',
    padding: `${tokens.spacingXs} ${tokens.spacingS}`,
  }),
};

type LocalePublishingStatusProps = {
  locale: Pick<LocaleProps, 'code' | 'default' | 'name'>;
  status: 'draft' | 'published' | 'changed';
  isScheduled: boolean;
};

export function LocalePublishingStatus({
  locale,
  status,
  isScheduled,
}: LocalePublishingStatusProps) {
  return (
    <div className={styles.localePublishStatus} data-test-id="locale-publishing-status">
      <Text className={styles.locale} fontColor="gray700">
        {locale.name}{' '}
        <Text fontColor="gray500">
          ({locale.code}){locale.default && ' | default'}
        </Text>
      </Text>
      <EntityStatusBadge
        entityStatus={status}
        isScheduled={isScheduled}
        className={styles.status}
      />
    </div>
  );
}
