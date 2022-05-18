import React, { useCallback, useEffect, useState } from 'react';

import { Autocomplete } from '@contentful/f36-components';

import allTimezones, { Timezone } from './utils/timezones';
import { defaultZoneOffset } from './utils/zoneOffsets';

import dayjs from 'dayjs';

import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

export type TimezonepickerProps = {
  disabled: boolean;
  onChange: (value: string) => void;
  value?: string;
};

export const TimezonepickerInput = ({
  disabled,
  onChange,
  value = defaultZoneOffset,
}: TimezonepickerProps) => {
  const defaultTimezone =
    allTimezones.find((timezone: Timezone) => timezone.ianaName === dayjs.tz.guess()) ||
    allTimezones.find(
      (timezone: Timezone) => dayjs.tz(undefined, timezone.ianaName).format('Z') === value
    );

  const [filteredTimezones, setFilteredTimezones] = useState(allTimezones);
  const [userInput, setUserInput] = useState(defaultTimezone as Timezone);

  useEffect(() => {
    if (!value) {
      setUserInput({
        displayValue: '',
        ianaName: '',
      } as Timezone);
    }
  }, [value]);

  const handleSelect = useCallback(
    (timezone) => {
      onChange(dayjs.tz(undefined, timezone.ianaName).format('Z'));
      setUserInput(timezone);
    },
    [onChange]
  );

  const handleChange = (val: string) => {
    const newFilteredTimezones = allTimezones.filter((timezone: Timezone) =>
      timezone.displayValue.toLowerCase().includes(val.toLowerCase())
    );
    setFilteredTimezones(newFilteredTimezones.length > 0 ? newFilteredTimezones : allTimezones);
  };

  return (
    <Autocomplete
      isDisabled={disabled}
      listMaxHeight={300}
      items={filteredTimezones.slice(0, 100)}
      itemToString={(timezone: Timezone) => timezone.displayValue}
      renderItem={(timezone: Timezone) => timezone.displayValue}
      onSelectItem={handleSelect}
      onInputValueChange={handleChange}
      selectedItem={userInput}
      placeholder="Pick a timezone"
      noMatchesMessage="No timezones found"
      testId="timezone-input"
    />
  );
};
