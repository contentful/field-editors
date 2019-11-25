import React, { ChangeEvent } from 'react';
import { Select, Option } from '@contentful/forma-36-react-components';
import { zoneOffsets, defaultZoneOffset } from './utils/zoneOffsets';

export type TimezonepickerProps = {
  disabled: boolean;
  onChange: (value: string) => void;
  value?: string;
};

export const TimezonepickerInput = ({
  disabled,
  onChange,
  value = defaultZoneOffset
}: TimezonepickerProps) => {
  return (
    <Select
      aria-label="Select timezone"
      testId="timezone-input"
      value={value}
      width="medium"
      isDisabled={disabled}
      onChange={(e: ChangeEvent<HTMLSelectElement>) => {
        onChange(e.currentTarget.value);
      }}>
      {zoneOffsets.map(offset => (
        <Option key={offset} value={offset}>
          UTC{offset}
        </Option>
      ))}
    </Select>
  );
};
