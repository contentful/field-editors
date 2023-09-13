import * as React from 'react';

import { TextLink } from '@contentful/f36-components';
import tokens from '@contentful/f36-tokens';
import { FieldAPI, FieldConnector, ParametersAPI } from '@contentful/field-editor-shared';
import { css } from 'emotion';

import { DatepickerInput } from './DatepickerInput';
import { TimepickerInput } from './TimepickerInput';
import { TimezonepickerInput } from './TimezonePickerInput';
import { TimeFormat, DateTimeFormat, TimeResult } from './types';
import {
  userInputFromDatetime,
  buildFieldValue,
  getDefaultAMPM,
  getDefaultUtcOffset,
} from './utils/date';

export interface DateEditorProps {
  /**
   * is the field disabled initially
   */
  isInitiallyDisabled: boolean;

  /*
   * is the field manually disabled
   */
  isDisabled?: boolean;

  /**
   * sdk.field
   */
  field: FieldAPI;

  /**
   * sdk.parameters
   */
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
    alignItems: 'center',
  }),
  separator: css({
    marginLeft: tokens.spacingM,
  }),
};

function useEffectWithoutFirstRender(callback: Function, deps: Array<any>) {
  const isFirstRun = React.useRef(true);
  React.useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }
    callback();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO: Evaluate the dependencies
  }, deps);
}

function DateEditorContainer({
  initialValue,
  usesTime,
  usesTimezone,
  uses12hClock,
  disabled,
  hasClear,
  onChange,
}: {
  initialValue: TimeResult;
  usesTime: boolean;
  usesTimezone: boolean;
  uses12hClock: boolean;
  disabled: boolean;
  hasClear: boolean;
  onChange: (value: TimeResult) => void;
}) {
  const [value, setValue] = React.useState<TimeResult>(() => initialValue);

  useEffectWithoutFirstRender(() => {
    onChange(value);
  }, [value]);

  return (
    <div data-test-id="date-editor" className={styles.root}>
      <DatepickerInput
        disabled={disabled}
        value={value.date}
        onChange={(date) => {
          setValue((value) => ({
            ...value,
            date,
          }));
        }}
      />
      {usesTime && (
        <>
          <div className={styles.separator} />
          <TimepickerInput
            disabled={disabled}
            time={value.time}
            ampm={value.ampm}
            onChange={({ time, ampm }) => {
              setValue((value) => ({
                ...value,
                time,
                ampm,
              }));
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
            value={value.utcOffset}
            onChange={(utcOffset) => {
              setValue((value) => ({
                ...value,
                utcOffset,
              }));
            }}
          />
        </>
      )}
      {hasClear && (
        <>
          <div className={styles.separator} />
          <TextLink
            as="button"
            isDisabled={disabled}
            testId="date-clear"
            onClick={() => {
              setValue({
                date: undefined,
                time: undefined,
                ampm: getDefaultAMPM(),
                utcOffset: getDefaultUtcOffset(),
              });
            }}
          >
            Clear
          </TextLink>
        </>
      )}
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

  return (
    <FieldConnector<string>
      field={field}
      isInitiallyDisabled={props.isInitiallyDisabled}
      isDisabled={props.isDisabled}
      debounce={0}
    >
      {({ value, disabled, setValue, externalReset }) => {
        const datetimeValue = userInputFromDatetime({
          value,
          uses12hClock,
        });
        return (
          <DateEditorContainer
            initialValue={datetimeValue}
            uses12hClock={uses12hClock}
            usesTimezone={usesTimezone}
            usesTime={usesTime}
            disabled={disabled}
            hasClear={Boolean(value)}
            onChange={(data) => {
              const fieldValue = buildFieldValue({ data, usesTime, usesTimezone });
              if (fieldValue.invalid) {
                return;
              }
              // if value is present - then override it with a new one
              // if value is not present - then set a new one if it's not nullable only
              if (Boolean(value) || (!value && Boolean(fieldValue.valid))) {
                setValue(fieldValue.valid);
              }
            }}
            key={`date-container-${externalReset}`}
          />
        );
      }}
    </FieldConnector>
  );
}

DateEditor.defaultProps = {
  isInitiallyDisabled: true,
};
