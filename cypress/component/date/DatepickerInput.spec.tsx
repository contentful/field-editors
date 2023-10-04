import * as React from 'react';

import timezonedDate from 'timezoned-date';

import { DatepickerInput } from '../../../packages/date/src/DatepickerInput';
import { userInputFromDatetime } from '../../../packages/date/src/utils/date';
import { mount } from '../mount';

describe('Date: DatepickerInput', () => {
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

    mount(<DatepickerInput value={date} onChange={cy.stub()} />);
  };

  describe('renders correct date, when the system UTC offset is +02:00 and the one in the props.value is', () => {
    it('+04:00', () => {
      global.Date = timezonedDate.makeConstructor(120);
      renderDatepicker('2022-09-22T00:00+04:00');
      cy.findByTestId('cf-ui-datepicker-input').should('have.value', '22 Sep 2022');
      // expect(screen.getByTestId('cf-ui-datepicker-input')).toHaveValue('22 Sep 2022');
    });

    it('+10:00', () => {
      global.Date = timezonedDate.makeConstructor(120);
      renderDatepicker('2022-09-22T00:00+10:00');
      cy.findByTestId('cf-ui-datepicker-input').should('have.value', '22 Sep 2022');
      // expect(screen.getByTestId('cf-ui-datepicker-input')).toHaveValue('22 Sep 2022');
    });

    it('-08:00', () => {
      global.Date = timezonedDate.makeConstructor(120);
      renderDatepicker('2022-09-22T00:00-08:00');
      cy.findByTestId('cf-ui-datepicker-input').should('have.value', '22 Sep 2022');
    });
  });

  describe('renders correct date, when the system UTC offset is -06:00 and the one in the props.value is', () => {
    it('+02:00', () => {
      global.Date = timezonedDate.makeConstructor(-360);
      renderDatepicker('2022-09-22T00:00+02:00');
      cy.findByTestId('cf-ui-datepicker-input').should('have.value', '22 Sep 2022');
    });

    it('+10:00', () => {
      global.Date = timezonedDate.makeConstructor(-360);
      renderDatepicker('2022-09-22T00:00+10:00');
      cy.findByTestId('cf-ui-datepicker-input').should('have.value', '22 Sep 2022');
    });

    it('-08:00', () => {
      global.Date = timezonedDate.makeConstructor(-360);
      renderDatepicker('2022-09-22T00:00-08:00');
      cy.findByTestId('cf-ui-datepicker-input').should('have.value', '22 Sep 2022');
    });
  });
});
