import React from 'react';

import { Badge, BadgeVariant, Text } from '@contentful/f36-components';
import tokens from '@contentful/f36-tokens';
import { t } from '@lingui/core/macro';
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

type ReleaseEntityStatusLocaleProps = {
  locale: Pick<LocaleProps, 'code' | 'default' | 'name'>;
  label: string;
  variant: BadgeVariant;
};

export function ReleaseEntityStatusLocale({
  locale,
  label,
  variant,
}: ReleaseEntityStatusLocaleProps) {
  const localeCode = locale.code;
  const isDefaultLocale = `${locale.default ? ', Default' : ''}`;

  return (
    <div className={styles.localePublishStatus} data-test-id="locale-publishing-status">
      <Text className={styles.locale} fontColor="gray700">
        {locale.name}{' '}
        <Text fontColor="gray500">
          {t({
            id: 'FieldEditors.Shared.ReleaseEntityStatusLocale.LocaleCode',
            message: `(${localeCode}) ${isDefaultLocale}`,
          })}
        </Text>
      </Text>
      <Badge className={styles.status} variant={variant}>
        {label}
      </Badge>
    </div>
  );
}
