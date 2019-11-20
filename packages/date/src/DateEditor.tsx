import * as React from 'react';
import { FieldAPI, FieldConnector, ParametersAPI } from '@contentful/field-editor-shared';
import { DatepickerInput } from './DatepickerInput';
import { TimepickerInput } from './TimepickerInput';
import { TimezonepickerInput } from './TimezonePickerInput';
import { userInputFromDatetime, buildFieldValue } from './utils/date';
import { TimeFormat, DateTimeFormat, TimeResult } from './types';

export interface DateEditorProps {
  /**
   * is the field disabled initially
   */
  isInitiallyDisabled: boolean;

  field: FieldAPI;

  parameters?: ParametersAPI & {
    instance?: {
      format?: DateTimeFormat;
      ampm?: TimeFormat;
    };
  };
}

export function DateEditor(props: DateEditorProps) {
  const { field, parameters } = props;

  const formatParam = parameters?.instance?.format ?? 'timeZ';
  const ampmParam = parameters?.instance?.ampm ?? '24';

  const usesTime = formatParam !== 'dateonly';
  const usesTimezone = formatParam === 'timeZ';
  const uses12hClock = ampmParam === '12';

  const buildCurrentFieldValue = (data: TimeResult) =>
    buildFieldValue({ data, uses12hClock, usesTime, usesTimezone });

  return (
    <FieldConnector<string>
      field={field}
      isInitiallyDisabled={props.isInitiallyDisabled}
      throttle={0}>
      {({ value, disabled, setValue, externalReset }) => {
        const datetimeValue = userInputFromDatetime({
          value,
          uses12hClock
        });

        return (
          <div data-test-id="date-editor">
            <DatepickerInput
              key={`datepicker-${externalReset}`}
              disabled={disabled}
              value={datetimeValue.date}
              onChange={value => {
                const date = buildCurrentFieldValue({
                  ...datetimeValue,
                  date: value ?? undefined
                });
                setValue(date);
              }}
            />
            {usesTime && (
              <TimepickerInput
                key={`timepicker-${externalReset}`}
                disabled={disabled}
                time={datetimeValue.time}
                ampm={datetimeValue.ampm}
                onChange={value => {
                  const date = buildCurrentFieldValue({
                    ...datetimeValue,
                    time: value.time ?? undefined,
                    ampm: value.ampm
                  });
                  setValue(date);
                }}
                uses12hClock={uses12hClock}
              />
            )}
            {usesTimezone && (
              <TimezonepickerInput
                key={`timezonepicker-${externalReset}`}
                disabled={disabled}
                value={datetimeValue.utcOffset}
                onChange={value => {
                  const date = buildCurrentFieldValue({
                    ...datetimeValue,
                    utcOffset: value
                  });
                  setValue(date);
                }}
              />
            )}
          </div>
        );
      }}
    </FieldConnector>
  );
}

DateEditor.defaultProps = {
  isInitiallyDisabled: true
};
