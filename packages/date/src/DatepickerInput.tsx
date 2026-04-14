import React, { useMemo } from 'react';

import { Datepicker } from '@contentful/f36-components';
import { css } from '@emotion/css';

const YEARS_INTO_FUTURE = 100;
const MIN_YEAR = '1000';

const styles = {
  root: css({
    maxWidth: '270px',
  }),
};

export type DatePickerProps = {
  value?: Date;
  onChange: (val: Date | undefined) => void;
  disabled?: boolean;
};

export const DatepickerInput = (props: DatePickerProps) => {
  const [fromDate, toDate] = useMemo(() => {
    const fromDate = new Date(MIN_YEAR);
    const toDate = new Date();
    toDate.setFullYear(toDate.getFullYear() + YEARS_INTO_FUTURE);

    return [fromDate, toDate];
  }, []);
  const selectedDate = props.value;

  return (
    <Datepicker
      className={styles.root}
      selected={selectedDate}
      onSelect={(day) => {
        props.onChange(day ?? undefined);
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
