import React, { useState, useCallback, useEffect } from 'react';

import { TextInput, Flex } from '@contentful/f36-components';
import { css } from '@emotion/css';
import { parse, format, isValid } from 'date-fns';

export type TimepickerProps = {
  disabled: boolean;
  uses12hClock: boolean;
  onChange: (value: { time: string; ampm: string }) => void;
  time?: string;
  ampm?: string;
};

const validInputFormats = [
  'hh:mm a',
  'h:mm a',
  'HH:mm',
  'HHmm',
  'hh:mm',
  'hhmm',
  'kk:mm',
  'k:mm',
  'h a',
  'HH',
  'H:mm',
  'h',
];
const REF_DATE = new Date(2000, 0, 1);

function parseRawInput(raw: string): Date | null {
  for (const fmt of validInputFormats) {
    const parsed = parse(raw, fmt, REF_DATE);
    if (isValid(parsed)) return parsed;
  }
  return null;
}

const getDefaultTime = () => parse('12:00 AM', 'hh:mm a', REF_DATE);

const formatToString = (uses12hClock: boolean, value: Date): string =>
  format(value, uses12hClock ? 'hh:mm a' : 'HH:mm');

export const TimepickerInput = ({
  disabled,
  uses12hClock,
  time = '00:00',
  ampm = 'AM',
  onChange,
}: TimepickerProps) => {
  const [selectedTime, setSelectedTime] = useState<string>(() => {
    return formatToString(uses12hClock, getDefaultTime());
  });

  useEffect(() => {
    const parsed = uses12hClock
      ? parse(`${time} ${ampm}`, 'hh:mm a', REF_DATE)
      : parse(time, 'HH:mm', REF_DATE);
    setSelectedTime(formatToString(uses12hClock, isValid(parsed) ? parsed : getDefaultTime()));
  }, [time, ampm, uses12hClock]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.currentTarget.value;
    setSelectedTime(raw);
  }, []);

  const handleFocus = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    e.preventDefault();
    e.target.select();
  }, []);

  const handleBlur = useCallback(() => {
    const parsedTime = parseRawInput(selectedTime);
    const value = parsedTime ?? getDefaultTime();
    setSelectedTime(formatToString(uses12hClock, value));
    const timeStr = uses12hClock ? format(value, 'hh:mm') : format(value, 'HH:mm');
    onChange({ time: timeStr, ampm: format(value, 'a').toUpperCase() });
  }, [selectedTime, uses12hClock, onChange]);

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
