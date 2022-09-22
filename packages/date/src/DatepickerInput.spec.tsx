/* eslint-disable no-global-assign -- need for test purposes */
import React from 'react';

import { render, configure, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import timezonedDate from 'timezoned-date';

import { DatepickerInput } from './DatepickerInput';
import { userInputFromDatetime } from './utils/date';

configure({
  testIdAttribute: 'data-test-id',
});

let originalDate: typeof Date;
beforeEach(() => {
  originalDate = global.Date;
});
afterEach(() => {
  global.Date = originalDate;
});

const renderDatepicker = (dateString: string) => {
  const { date } = userInputFromDatetime({
    value: dateString,
    uses12hClock: false,
  });

  return render(<DatepickerInput value={date} onChange={jest.fn()} />);
};

describe('Date: DatepickerInput', function () {
  describe('renders correct date, when the system UTC offset is +02:00 and the one in the props.value is', () => {
    it('+04:00', async () => {
      global.Date = timezonedDate.makeConstructor(120);
      renderDatepicker('2022-09-22T00:00+04:00');
      expect(screen.getByTestId('cf-ui-datepicker-input')).toHaveValue('22 Sep 2022');
    });

    it('+10:00', async () => {
      global.Date = timezonedDate.makeConstructor(120);
      renderDatepicker('2022-09-22T00:00+10:00');
      expect(screen.getByTestId('cf-ui-datepicker-input')).toHaveValue('22 Sep 2022');
    });

    it('-08:00', async () => {
      global.Date = timezonedDate.makeConstructor(120);
      renderDatepicker('2022-09-22T00:00-08:00');
      expect(screen.getByTestId('cf-ui-datepicker-input')).toHaveValue('22 Sep 2022');
    });
  });

  describe('renders correct date, when the system UTC offset is -06:00 and the one in the props.value is', () => {
    it('+02:00', async () => {
      global.Date = timezonedDate.makeConstructor(-360);
      renderDatepicker('2022-09-22T00:00+02:00');
      expect(screen.getByTestId('cf-ui-datepicker-input')).toHaveValue('22 Sep 2022');
    });

    it('+10:00', async () => {
      global.Date = timezonedDate.makeConstructor(-360);
      renderDatepicker('2022-09-22T00:00+10:00');
      expect(screen.getByTestId('cf-ui-datepicker-input')).toHaveValue('22 Sep 2022');
    });

    it('-08:00', async () => {
      global.Date = timezonedDate.makeConstructor(-360);
      renderDatepicker('2022-09-22T00:00-08:00');
      expect(screen.getByTestId('cf-ui-datepicker-input')).toHaveValue('22 Sep 2022');
    });
  });
});
