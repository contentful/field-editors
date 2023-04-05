import React, { ChangeEvent } from 'react';

import { Select } from '@contentful/f36-components';

import { zoneOffsets, defaultZoneOffset } from './utils/zoneOffsets';


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
  return (
    <Select
      aria-label="Select timezone"
      testId="timezone-input"
      value={value}
      isDisabled={disabled}
      onChange={(e: ChangeEvent<HTMLSelectElement>) => {
        onChange(e.currentTarget.value);
      }}>
      {zoneOffsets.map((offset) => (
        <Select.Option key={offset} value={offset}>
          UTC{offset}
        </Select.Option>
      ))}
    </Select>
  );
};
