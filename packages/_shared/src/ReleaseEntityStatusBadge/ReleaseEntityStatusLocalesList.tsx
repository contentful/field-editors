import React from 'react';

import { MenuSectionTitle } from '@contentful/f36-components';
import type { LocaleProps } from 'contentful-management';
import { sortBy } from 'lodash';

import { ReleaseLocalesStatus, ReleaseLocalesStatusMap } from '../types';
import { Banner } from './Banner';
import { ReleaseEntityStatusLocale } from './ReleaseEntityStatusLocale';

function groupAndSortLocales(
  entries: [string, ReleaseLocalesStatus][],
  activeLocales?: Pick<LocaleProps, 'code'>[],
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
    { selected: [] as ReleaseLocalesStatus[], nonSelected: [] as ReleaseLocalesStatus[] },
  );

  return {
    // selected are just sorted by name
    selected: sortBy(selected, 'locale.name'),
    // non-selected are grouped by status and sort inside the group alphabetical
    nonSelected: nonSelected.sort((a, b) => {
      if (a.status === b.status) {
        return a.locale.name.localeCompare(b.locale.name);
      }

      if (
        a.status === 'becomesDraft' ||
        (a.status === 'willPublish' && b.status === 'remainsDraft')
      ) {
        return -1;
      }

      return 1;
    }),
  };
}

type ReleaseEntityStatusLocalesListProps = {
  statusMap: ReleaseLocalesStatusMap;
  activeLocales?: Pick<LocaleProps, 'code'>[];
};

export function ReleaseEntityStatusLocalesList({
  statusMap,
  activeLocales,
}: ReleaseEntityStatusLocalesListProps) {
  const entries = [...statusMap.entries()];
  const counters = entries.reduce(
    (prev, [, { status }]) => ({
      becomesDraft: prev.becomesDraft + (status === 'becomesDraft' ? 1 : 0),
      willPublish: prev.willPublish + (status === 'willPublish' ? 1 : 0),
      remainsDraft: prev.remainsDraft + (status === 'remainsDraft' ? 1 : 0),
    }),
    { willPublish: 0, becomesDraft: 0, remainsDraft: 0 },
  );

  const { selected, nonSelected } = groupAndSortLocales(entries, activeLocales);
  return (
    <>
      <Banner
        content="The statuses of the locales for this content:"
        highlight={`${counters.becomesDraft} becomes draft, ${counters.willPublish} will publish, ${counters.remainsDraft} remains draft`}
      />

      <div data-test-id="locale-publishing-selected">
        <MenuSectionTitle>Locales in the entry editor:</MenuSectionTitle>
        {selected.map(({ locale, label, variant }) => (
          <ReleaseEntityStatusLocale
            key={`selected-${locale.code}`}
            label={label}
            variant={variant}
            locale={locale}
          />
        ))}
      </div>

      {nonSelected.length > 0 && (
        <div data-test-id="locale-publishing-others">
          <MenuSectionTitle>Other locales:</MenuSectionTitle>
          {nonSelected.map(({ locale, label, variant }) => (
            <ReleaseEntityStatusLocale
              key={`others-${locale.code}`}
              label={label}
              variant={variant}
              locale={locale}
            />
          ))}
        </div>
      )}
    </>
  );
}
