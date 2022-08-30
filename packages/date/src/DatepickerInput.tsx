import React, { useMemo } from 'react';

import { Datepicker } from '@contentful/f36-datepicker';
import { css } from 'emotion';
// eslint-disable-next-line -- TODO: describe this disable  no-restricted-imports
import moment from 'moment';

const YEAR_RANGE = 100;

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
    const fromDate = new Date();
    fromDate.setFullYear(fromDate.getFullYear() - YEAR_RANGE);
    const toDate = new Date();
    toDate.setFullYear(toDate.getFullYear() + YEAR_RANGE);

    return [fromDate, toDate];
  }, []);

  return (
    <Datepicker
      className={styles.root}
      selected={props.value?.toDate()}
      onSelect={(day) => {
        props.onChange(moment(day));
      }}
      inputProps={{ isDisabled: props.disabled, placeholder: '' }}
      fromDate={fromDate}
      toDate={toDate}
    />
  );
};
