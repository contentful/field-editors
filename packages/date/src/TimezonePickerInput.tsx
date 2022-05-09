import React, { useCallback, useState } from 'react';

import { Autocomplete } from '@contentful/f36-components';
import moment from 'moment-timezone';

import allTimezones, { Timezone } from './utils/timezones';
import { defaultZoneOffset } from './utils/zoneOffsets';

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
  const defaultTimezone = allTimezones.find(
    (timezone) =>
      moment.tz(timezone.ianaName).format('Z') === value || timezone.ianaName === moment.tz.guess()
  );

  const [filteredTimezones, setFilteredTimezones] = useState(allTimezones);
  const [userInput, setUserInput] = useState(defaultTimezone);

  const handleSelect = useCallback(
    (timezone) => {
      onChange(moment.tz(timezone.ianaName).format('Z'));
      setUserInput(timezone);
    },
    [onChange]
  );

  const handleChange = (val: string) => {
    const newFilteredTimezones = allTimezones.filter((timezones) =>
      timezones.displayValue.toLowerCase().includes(val.toLowerCase())
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
      placeholder={userInput?.displayValue}
      noMatchesMessage="No timezones found"
    />
  );
};
