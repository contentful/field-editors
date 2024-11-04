import React from 'react';

import { MenuSectionTitle } from '@contentful/f36-components';
import type { LocaleProps } from 'contentful-management';
import { sortBy } from 'lodash';

import type {
  LocalePublishStatusMap,
  LocalePublishStatus as LocalePublishStatusType,
} from '../hooks/useLocalePublishStatus';
import { Banner } from './Banner';
import { LocalePublishingStatus } from './LocalePublishingStatus';

function groupAndSortLocales(
  entries: [string, LocalePublishStatusType][],
  activeLocales?: Pick<LocaleProps, 'code'>[]
) {
  // Group into selected locales (for editing) and non selected
  const { selected, nonSelected } = entries.reduce(
    (prev, [localeCode, localeStatusType]) => {
      return activeLocales?.some((sl) => sl.code === localeCode)
        ? {
            ...prev,
            selected: [...prev.selected, localeStatusType],
          }
        : {
            ...prev,
            nonSelected: [...prev.nonSelected, localeStatusType],
          };
    },
    { selected: [] as LocalePublishStatusType[], nonSelected: [] as LocalePublishStatusType[] }
  );

  return {
    // selected are just sorted by name
    selected: sortBy(selected, 'locale.name'),
    // non-selected are grouped by status and sort inside the group alphabetical
    nonSelected: nonSelected.sort((a, b) => {
      if (a.status === b.status) {
        return a.locale.name.localeCompare(b.locale.name);
      }

      if (a.status === 'changed' || (a.status === 'published' && b.status === 'draft')) {
        return -1;
      }

      return 1;
    }),
  };
}

type LocalePublishingStatusListProps = {
  isScheduled: boolean;
  statusMap: LocalePublishStatusMap;
  activeLocales?: Pick<LocaleProps, 'code'>[];
};

export function LocalePublishingStatusList({
  isScheduled,
  statusMap,
  activeLocales,
}: LocalePublishingStatusListProps) {
  const entries = [...statusMap.entries()];
  const counters = entries.reduce(
    (prev, [, { status }]) => ({
      changed: prev.changed + (status === 'changed' ? 1 : 0),
      published: prev.published + (status === 'published' ? 1 : 0),
      draft: prev.draft + (status === 'draft' ? 1 : 0),
    }),
    { published: 0, changed: 0, draft: 0 }
  );

  const { selected, nonSelected } = groupAndSortLocales(entries, activeLocales);
  return (
    <>
      <Banner
        content="The entry has locales with the following statuses:"
        highlight={`${counters.changed} changed, ${counters.published} published, ${counters.draft} draft`}
      />

      <div data-test-id="locale-publishing-selected">
        <MenuSectionTitle>Locales in the entry editor:</MenuSectionTitle>
        {selected.map(({ locale, status }) => (
          <LocalePublishingStatus
            key={`selected-${locale.code}`}
            status={status}
            locale={locale}
            isScheduled={isScheduled}
          />
        ))}
      </div>

      {nonSelected.length > 0 && (
        <div data-test-id="locale-publishing-others">
          <MenuSectionTitle>Other locales:</MenuSectionTitle>
          {nonSelected.map(({ locale, status }) => (
            <LocalePublishingStatus
              key={`others-${locale.code}`}
              status={status}
              locale={locale}
              isScheduled={isScheduled}
            />
          ))}
        </div>
      )}
    </>
  );
}
