import React, { useMemo } from 'react';

import { Datepicker } from '@contentful/f36-components';
import { css } from 'emotion';
// eslint-disable-next-line -- TODO: move to date-fns
import moment from 'moment';

const YEARS_INTO_FUTURE = 100;
const MIN_YEAR = '1000';

const styles = {
  root: css({
    maxWidth: '270px',
  }),
};

export type DatePickerProps = {
  value?: moment.Moment;
  onChange: (val: moment.Moment | undefined) => void;
  disabled?: boolean;
};

export const DatepickerInput = (props: DatePickerProps) => {
  const [fromDate, toDate] = useMemo(() => {
    const fromDate = new Date(MIN_YEAR);
    const toDate = new Date();
    toDate.setFullYear(toDate.getFullYear() + YEARS_INTO_FUTURE);

    return [fromDate, toDate];
  }, []);
  // The DatepickerInput should be time and timezone agnostic,
  // thats why we don't use moment().toDate() to get Date object.
  // moment().toDate() takes into account time and timezone and converts it
  // based on your system timezone which can result in the date change.
  // e.g. if user has a timezone +02:00, moment('2022-09-16T00:00+04:00').toDate()
  // will return September 15 instead of September 16
  const dateObj = props.value?.toObject();
  const selectedDate = dateObj ? new Date(dateObj.years, dateObj.months, dateObj.date) : undefined;

  return (
    <Datepicker
      className={styles.root}
      selected={selectedDate}
      onSelect={(day) => {
        const momentDay = day ? moment(day) : undefined;
        props.onChange(momentDay);
      }}
      inputProps={{ isDisabled: props.disabled, placeholder: '' }}
      //fromDate and toDate are necessary to show the year dropdown
      // there is a customer need to go back more than 100 years
      // when the underlying library react-day-picker gets updated to v9, we should make sure to set fromYear to a greater value
      fromDate={fromDate}
      toDate={toDate}
    />
  );
};
