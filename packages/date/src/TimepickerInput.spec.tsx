import * as React from 'react';

import '@testing-library/jest-dom/extend-expect';
import { cleanup, configure, render } from '@testing-library/react';

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
});
