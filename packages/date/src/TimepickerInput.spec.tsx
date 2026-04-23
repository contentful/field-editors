import * as React from 'react';

import '@testing-library/jest-dom/extend-expect';
import { cleanup, configure, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { TimepickerInput } from './TimepickerInput';

configure({
  testIdAttribute: 'data-test-id',
});

describe('TimepickerInput', () => {
  afterEach(cleanup);

  it('renders midnight (00:00) in 24h mode without crashing', () => {
    // Regression: parse('00:00 AM', 'hh:mm a') returns Invalid Date because
    // hh expects 1-12; format() then threw RangeError: Invalid time value.
    const { getByTestId } = render(
      <TimepickerInput
        disabled={false}
        uses12hClock={false}
        time="00:00"
        ampm="AM"
        onChange={jest.fn()}
      />,
    );
    expect(getByTestId('time-input')).toHaveValue('00:00');
  });

  it('defaults to 00:00 in 24h mode when no time prop is provided', () => {
    const { getByTestId } = render(
      <TimepickerInput disabled={false} uses12hClock={false} onChange={jest.fn()} />,
    );
    expect(getByTestId('time-input')).toHaveValue('00:00');
  });

  it('defaults to 12:00 AM in 12h mode when no time prop is provided', () => {
    const { getByTestId } = render(
      <TimepickerInput disabled={false} uses12hClock={true} onChange={jest.fn()} />,
    );
    expect(getByTestId('time-input')).toHaveValue('12:00 AM');
  });

  it('renders late-night hours (e.g. 23:00) in 24h mode without crashing', () => {
    const { getByTestId } = render(
      <TimepickerInput
        disabled={false}
        uses12hClock={false}
        time="23:00"
        ampm="PM"
        onChange={jest.fn()}
      />,
    );
    expect(getByTestId('time-input')).toHaveValue('23:00');
  });

  describe('onChange on blur — 24h mode', () => {
    it('emits 19:00 (not 07:00) when user types 19:00 in 24h mode', () => {
      const onChange = jest.fn();
      const { getByTestId } = render(
        <TimepickerInput
          disabled={false}
          uses12hClock={false}
          time="19:00"
          ampm="PM"
          onChange={onChange}
        />,
      );
      userEvent.clear(getByTestId('time-input'));
      userEvent.type(getByTestId('time-input'), '19:00');
      userEvent.tab();
      expect(onChange).toHaveBeenCalledWith({ time: '19:00', ampm: 'PM' });
    });

    it('emits 23:59 (not 11:59) when user types 23:59 in 24h mode', () => {
      const onChange = jest.fn();
      const { getByTestId } = render(
        <TimepickerInput
          disabled={false}
          uses12hClock={false}
          time="23:59"
          ampm="PM"
          onChange={onChange}
        />,
      );
      userEvent.clear(getByTestId('time-input'));
      userEvent.type(getByTestId('time-input'), '23:59');
      userEvent.tab();
      expect(onChange).toHaveBeenCalledWith({ time: '23:59', ampm: 'PM' });
    });

    it('emits 00:00 when user types 00:00 in 24h mode', () => {
      const onChange = jest.fn();
      const { getByTestId } = render(
        <TimepickerInput
          disabled={false}
          uses12hClock={false}
          time="00:00"
          ampm="AM"
          onChange={onChange}
        />,
      );
      userEvent.clear(getByTestId('time-input'));
      userEvent.type(getByTestId('time-input'), '00:00');
      userEvent.tab();
      expect(onChange).toHaveBeenCalledWith({ time: '00:00', ampm: 'AM' });
    });

    it('emits 12:00 (noon) correctly in 24h mode', () => {
      const onChange = jest.fn();
      const { getByTestId } = render(
        <TimepickerInput
          disabled={false}
          uses12hClock={false}
          time="12:00"
          ampm="PM"
          onChange={onChange}
        />,
      );
      userEvent.clear(getByTestId('time-input'));
      userEvent.type(getByTestId('time-input'), '12:00');
      userEvent.tab();
      expect(onChange).toHaveBeenCalledWith({ time: '12:00', ampm: 'PM' });
    });

    it('emits 13:00 (not 01:00) when user types 13:00 in 24h mode', () => {
      const onChange = jest.fn();
      const { getByTestId } = render(
        <TimepickerInput
          disabled={false}
          uses12hClock={false}
          time="13:00"
          ampm="PM"
          onChange={onChange}
        />,
      );
      userEvent.clear(getByTestId('time-input'));
      userEvent.type(getByTestId('time-input'), '13:00');
      userEvent.tab();
      expect(onChange).toHaveBeenCalledWith({ time: '13:00', ampm: 'PM' });
    });
  });

  describe('shorthand input without colon', () => {
    it('parses 1005 as 10:05 in 24h mode', () => {
      const onChange = jest.fn();
      const { getByTestId } = render(
        <TimepickerInput
          disabled={false}
          uses12hClock={false}
          time="00:00"
          ampm="AM"
          onChange={onChange}
        />,
      );
      userEvent.clear(getByTestId('time-input'));
      userEvent.type(getByTestId('time-input'), '1005');
      userEvent.tab();
      expect(onChange).toHaveBeenCalledWith({ time: '10:05', ampm: 'AM' });
    });

    it('parses 1900 as 19:00 in 24h mode', () => {
      const onChange = jest.fn();
      const { getByTestId } = render(
        <TimepickerInput
          disabled={false}
          uses12hClock={false}
          time="00:00"
          ampm="AM"
          onChange={onChange}
        />,
      );
      userEvent.clear(getByTestId('time-input'));
      userEvent.type(getByTestId('time-input'), '1900');
      userEvent.tab();
      expect(onChange).toHaveBeenCalledWith({ time: '19:00', ampm: 'PM' });
    });

    it('parses 0700 as 07:00 AM in 12h mode', () => {
      const onChange = jest.fn();
      const { getByTestId } = render(
        <TimepickerInput
          disabled={false}
          uses12hClock={true}
          time="12:00"
          ampm="AM"
          onChange={onChange}
        />,
      );
      userEvent.clear(getByTestId('time-input'));
      userEvent.type(getByTestId('time-input'), '0700');
      userEvent.tab();
      expect(onChange).toHaveBeenCalledWith({ time: '07:00', ampm: 'AM' });
    });
  });

  describe('onChange on blur — 12h mode', () => {
    it('emits 07:00 AM correctly in 12h mode', () => {
      const onChange = jest.fn();
      const { getByTestId } = render(
        <TimepickerInput
          disabled={false}
          uses12hClock={true}
          time="07:00"
          ampm="AM"
          onChange={onChange}
        />,
      );
      userEvent.clear(getByTestId('time-input'));
      userEvent.type(getByTestId('time-input'), '07:00 AM');
      userEvent.tab();
      expect(onChange).toHaveBeenCalledWith({ time: '07:00', ampm: 'AM' });
    });

    it('emits 07:00 PM correctly in 12h mode', () => {
      const onChange = jest.fn();
      const { getByTestId } = render(
        <TimepickerInput
          disabled={false}
          uses12hClock={true}
          time="07:00"
          ampm="PM"
          onChange={onChange}
        />,
      );
      userEvent.clear(getByTestId('time-input'));
      userEvent.type(getByTestId('time-input'), '07:00 PM');
      userEvent.tab();
      expect(onChange).toHaveBeenCalledWith({ time: '07:00', ampm: 'PM' });
    });
  });
});
