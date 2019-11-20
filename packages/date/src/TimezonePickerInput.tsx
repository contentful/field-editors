import React, { ChangeEvent } from 'react';
import { Select, Option } from '@contentful/forma-36-react-components';

import { css } from 'emotion';
import { zoneOffsets, defaultZoneOffset } from './utils/zoneOffsets';
import tokens from '@contentful/forma-36-tokens';

const styles = {
  root: css({
    display: 'inline-block',
    marginLeft: tokens.spacingM
  })
};

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
    <div className={styles.root}>
      <Select
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
    </div>
  );
};
