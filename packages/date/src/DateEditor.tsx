import * as React from 'react';
import { css } from 'emotion';
import tokens from '@contentful/forma-36-tokens';
import { TextLink } from '@contentful/forma-36-react-components';
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

const styles = {
  root: css({
    display: 'flex',
    alignItems: 'center'
  }),
  separator: css({
    marginLeft: tokens.spacingM
  })
};

function DateEditorContainer({
  initialValue,
  usesTime,
  usesTimezone,
  uses12hClock,
  disabled,
  setValue,
  buildCurrentFieldValue
}: {
  initialValue: TimeResult;
  usesTime: boolean;
  usesTimezone: boolean;
  uses12hClock: boolean;
  disabled: boolean;
  setValue: (val: string | null | undefined) => void;
  buildCurrentFieldValue: (date: TimeResult) => string | null;
}) {
  return (
    <div data-test-id="date-editor" className={styles.root}>
      <DatepickerInput
        disabled={disabled}
        value={initialValue.date}
        onChange={value => {
          const date = buildCurrentFieldValue({
            ...initialValue,
            date: value ?? undefined
          });
          setValue(date);
        }}
      />
      {usesTime && (
        <>
          <div className={styles.separator} />
          <TimepickerInput
            disabled={disabled}
            time={initialValue.time}
            ampm={initialValue.ampm}
            onChange={value => {
              const date = buildCurrentFieldValue({
                ...initialValue,
                time: value.time ?? undefined,
                ampm: value.ampm
              });
              setValue(date);
            }}
            uses12hClock={uses12hClock}
          />
        </>
      )}
      {usesTimezone && (
        <>
          <div className={styles.separator} />
          <TimezonepickerInput
            disabled={disabled}
            value={initialValue.utcOffset}
            onChange={value => {
              const date = buildCurrentFieldValue({
                ...initialValue,
                utcOffset: value
              });
              setValue(date);
            }}
          />
        </>
      )}
      <div className={styles.separator} />
      <TextLink
        disabled={disabled}
        testId="date-clear"
        onClick={() => {
          setValue(null);
        }}>
        Clear
      </TextLink>
    </div>
  );
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
          <DateEditorContainer
            buildCurrentFieldValue={buildCurrentFieldValue}
            initialValue={datetimeValue}
            uses12hClock={uses12hClock}
            usesTimezone={usesTimezone}
            usesTime={usesTime}
            disabled={disabled}
            setValue={setValue}
            key={`date-container-${externalReset}`}
          />
        );
      }}
    </FieldConnector>
  );
}

DateEditor.defaultProps = {
  isInitiallyDisabled: true
};
