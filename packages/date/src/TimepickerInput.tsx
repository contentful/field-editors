import React, { useState, useCallback, useEffect } from 'react';

// eslint-disable-next-line -- TODO: move to date-fns
import { TextInput, Flex } from '@contentful/f36-components';
import { css } from 'emotion';
// eslint-disable-next-line no-restricted-imports -- will change
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
  'HH',
];

function parseRawInput(raw: string): moment.Moment | null {
  let time: moment.Moment | null = null;

  // eslint-disable-next-line -- TODO: refactor to use for of loop
  for (let i = 0; i < validInputFormats.length; i++) {
    const date = moment(raw, validInputFormats[i]);
    if (date.isValid()) {
      time = date;
      break;
    }
  }

  return time;
}

const getDefaultTime = () => {
  return moment(`12:00 AM`, 'hh:mm A');
};

const formatToString = (uses12hClock: boolean, value: moment.Moment): string => {
  return uses12hClock ? value.format('hh:mm A') : value.format('HH:mm');
};

export const TimepickerInput = ({
  disabled,
  uses12hClock,
  time = '12:00',
  ampm = 'AM',
  onChange,
}: TimepickerProps) => {
  const [selectedTime, setSelectedTime] = useState<string>(() => {
    return formatToString(uses12hClock, getDefaultTime());
  });

  useEffect(() => {
    setSelectedTime(formatToString(uses12hClock, moment(`${time} ${ampm}`, 'hh:mm A')));
  }, [time, ampm, uses12hClock]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedTime(e.currentTarget.value);
  }, []);

  const handleFocus = useCallback((e) => {
    e.preventDefault();
    e.target.select();
  }, []);

  const handleBlur = () => {
    const parsedTime = parseRawInput(selectedTime);
    const value = parsedTime ?? getDefaultTime();
    setSelectedTime(formatToString(uses12hClock, value));
    onChange({ time: value.format('hh:mm'), ampm: value.format('A') });
  };

  return (
    <Flex className={css({ width: '145px' })}>
      <TextInput
        aria-label="Select time"
        placeholder={uses12hClock ? '12:00 AM' : '00:00'}
        date-time-type={uses12hClock ? '12' : '24'}
        testId="time-input"
        value={selectedTime}
        isDisabled={disabled}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onChange={handleChange}
      />
    </Flex>
  );
};
