import React, { useState, useCallback } from 'react';
import { TextInput } from '@contentful/forma-36-react-components';
// eslint-disable-next-line no-restricted-imports
import moment from 'moment';

export type TimepickerProps = {
  disabled: boolean;
  uses12hClock: boolean;
  onChange: (value: { time: string; ampm: string }) => void;
  time?: string;
  ampm?: string;
};

const validInputFormats = [
  'hh:mm a',
  'hh:mm A',
  'h:mm a',
  'h:mm A',
  'hh:mm',
  'k:mm',
  'kk:mm',
  'h a',
  'h A',
  'h',
  'hh',
  'HH'
];

function parseRawInput(raw: string): moment.Moment | null {
  let time: moment.Moment | null = null;

  // eslint-disable-next-line @typescript-eslint/prefer-for-of
  for (let i = 0; i < validInputFormats.length; i++) {
    const date = moment(raw, validInputFormats[i]);
    if (date.isValid()) {
      time = date;
      break;
    }
  }

  return time;
}

export const TimepickerInput = ({
  disabled,
  uses12hClock,
  time = '00:00',
  ampm = 'AM',
  onChange
}: TimepickerProps) => {
  const formatToString = (value: moment.Moment): string => {
    return uses12hClock ? value.format('hh:mm A') : value.format('HH:mm');
  };

  const initialValue = moment(`${time} ${ampm}`, 'hh:mm A');

  const [selectedTime, setSelectedTime] = useState(formatToString(initialValue));

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedTime(e.currentTarget.value);
  }, []);

  const handleFocus = useCallback(e => {
    e.preventDefault();
    e.target.select();
  }, []);

  const handleBlur = () => {
    const parsedTime = parseRawInput(selectedTime);
    const value = parsedTime ?? initialValue;
    setSelectedTime(formatToString(value));
    onChange({ time: value.format('hh:mm'), ampm: value.format('A') });
  };

  return (
    <TextInput
      aria-label="Select time"
      placeholder={uses12hClock ? '12:00 AM' : '00:00'}
      date-time-type={uses12hClock ? '12' : '24'}
      testId="time-input"
      value={selectedTime}
      width="small"
      disabled={disabled}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onChange={handleChange}
    />
  );
};
