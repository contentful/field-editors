import React from 'react';

import { Datepicker } from '@contentful/f36-datepicker';
import { css } from 'emotion';
// eslint-disable-next-line -- TODO: describe this disable  no-restricted-imports
import moment from 'moment';

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
  console.log('props.value', props.value);

  return (
    <Datepicker
      testId="date-input"
      className={styles.root}
      selected={props.value?.toDate() ?? undefined}
      onSelect={(day) => {
        props.onChange(moment(day));
      }}
      inputProps={{ isDisabled: props.disabled, placeholder: '' }}
    />
  );
};
