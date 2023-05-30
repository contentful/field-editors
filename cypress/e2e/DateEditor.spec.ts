import { getIframe } from '../fixtures/utils';

const MONTHS = {
  0: 'Jan',
  1: 'Feb',
  2: 'Mar',
  3: 'Apr',
  4: 'May',
  5: 'Jun',
  6: 'Jul',
  7: 'Aug',
  8: 'Sep',
  9: 'Oct',
  10: 'Nov',
  11: 'Dec',
};

describe('Date Editor', () => {
  const now = new Date();

  const selectors = {
    getDateInput: () => {
      return getIframe().findByTestId('cf-ui-datepicker-input');
    },
    getCalendarTrigger: () => {
      return getIframe().findByTestId('cf-ui-datepicker-button');
    },
    getTimeInput: () => {
      return getIframe().findByTestId('time-input');
    },
    getTimezoneInput: () => {
      return getIframe().findByTestId('timezone-input');
    },
    getClearBtn: () => {
      return getIframe().findByTestId('date-clear');
    },
    getCalendar: () => {
      return getIframe().find('.rdp');
    },
    getCalendarMonth: () => {
      return getIframe().find('.rdp select[aria-label="Month: "]');
    },
    getCalendarYear: () => {
      return getIframe().find('.rdp select[aria-label="Year: "]');
    },
    getCalendarTodayDate: () => {
      return getIframe().find('.rdp .rdp-day_today');
    },
    getCalendarSelectedDate: () => {
      return getIframe().find('.rdp .rdp-day_selected');
    },
  };

  const getToday = () => {
    const month = now.getMonth();
    const year = now.getFullYear();
    const date = now.getDate();
    return {
      month,
      year,
      date,
    };
  };

  const getTodayShortString = () => {
    return `${getToday().date} ${MONTHS[getToday().month]} ${getToday().year}`;
  };

  const getTodayKebabString = () => {
    const date = `${getToday().date}`.padStart(2, '0');
    const month = `${getToday().month + 1}`.padStart(2, '0');

    return `${getToday().year}-${month}-${date}`;
  };

  const getTimezoneOffsetString = () => {
    const currentDate = new Date();
    const offsetInMinutes = currentDate.getTimezoneOffset();
    const offsetHours = Math.floor(Math.abs(offsetInMinutes) / 60);
    const offsetMinutes = Math.abs(offsetInMinutes) % 60;
    const offsetSign = offsetInMinutes <= 0 ? '+' : '-';

    return `${offsetSign}${offsetHours.toString().padStart(2, '0')}:${offsetMinutes
      .toString()
      .padStart(2, '0')}`;
  };

  const openPage = () => {
    cy.visit('/?path=/story/editors-date--default');
  };

  beforeEach(() => {
    cy.visit('/?path=/story/editors-date--default');
  });

  describe('disabled state', () => {
    it('all fields should be disabled', () => {
      cy.setInitialDisabled(true);
      openPage();
      cy.wait(500);

      selectors.getDateInput().should('be.disabled');
      selectors.getTimeInput().should('be.disabled');
      selectors.getTimezoneInput().should('be.disabled');
      selectors.getClearBtn().should('not.exist');
    });
  });

  describe('default configuration', () => {
    it('should read initial value', () => {
      openPage();
      cy.setInitialValue('2018-01-03T05:53+03:00');

      selectors.getDateInput().should('have.value', '03 Jan 2018');
      selectors.getTimeInput().should('have.value', '05:53');
      selectors.getTimezoneInput().should('have.value', '+03:00');
    });

    it('should render date, time (24 format) and timezone inputs by default', () => {
      openPage();
      selectors.getDateInput().should('be.visible').should('have.value', '');
      selectors
        .getTimeInput()
        .should('be.visible')
        .should('have.attr', 'date-time-type', '24')
        .should('have.attr', 'placeholder', '00:00')
        .should('have.value', '00:00');
      // TODO find a better way
      selectors
        .getTimezoneInput()
        .should('be.visible')
        .should('have.value', getTimezoneOffsetString());
    });

    it('calendar should show current year, month and date', () => {
      openPage();
      const { year, month, date } = getToday();

      selectors.getCalendarTrigger().click();

      selectors.getCalendar().should('be.visible');
      selectors.getCalendarYear().should('have.value', year.toString());
      selectors.getCalendarMonth().should('have.value', month.toString());
      selectors.getCalendarTodayDate().should('have.text', date.toString());
      selectors.getCalendarSelectedDate().should('not.exist');
    });

    it('correct actions are called when user interacts with editor', () => {
      openPage();
      selectors.getTimezoneInput().select('+08:00').should('have.value', '+08:00');

      selectors.getCalendarTrigger().click();
      selectors.getCalendarTodayDate().click();
      selectors.getDateInput().should('have.value', getTodayShortString());

      selectors.getTimeInput().focus().type('15:00').should('have.value', '15:00');

      selectors.getClearBtn().click();

      selectors.getDateInput().should('have.value', '');
      selectors.getTimeInput().should('have.value', '00:00');
      selectors.getTimezoneInput().should('have.value', getTimezoneOffsetString());
      selectors.getClearBtn().should('not.exist');

      cy.editorEvents().should('deep.equal', [
        { id: 6, type: 'onValueChanged', value: undefined },
        { id: 5, type: 'removeValue', value: undefined },
        { id: 4, type: 'onValueChanged', value: getTodayKebabString() + 'T15:00+08:00' },
        { id: 3, type: 'setValue', value: getTodayKebabString() + 'T15:00+08:00' },
        { id: 2, type: 'onValueChanged', value: getTodayKebabString() + 'T00:00+08:00' },
        { id: 1, type: 'setValue', value: getTodayKebabString() + 'T00:00+08:00' },
      ]);
    });

    it('should reset field state on external change', () => {
      cy.setInitialValue('1990-01-03T22:53+03:00');

      openPage();

      selectors.getDateInput().should('have.value', '03 Jan 1990');
      selectors.getTimeInput().should('have.value', '22:53');
      selectors.getTimezoneInput().should('have.value', '+03:00');

      cy.setValueExternal('1992-01-03T21:40+05:00');

      cy.wait(500);

      selectors.getDateInput().should('have.value', '03 Jan 1992');
      selectors.getTimeInput().should('have.value', '21:40');
      selectors.getTimezoneInput().should('have.value', '+05:00');
    });

    it('should parse values in time input', () => {
      openPage();
      selectors.getTimeInput().should('have.value', '00:00');

      const pairs = [
        ['3 PM', '15:00'],
        ['1:01', '01:01'],
        ['5', '05:00'],
        ['99', '00:00'],
        ['asdasd', '00:00'],
        ['9:43 AM', '09:43'],
      ];

      pairs.forEach((pair) => {
        selectors.getTimeInput().type(pair[0]);
        // blur doesn't work inside the iframe so clicking a different element instead
        selectors.getDateInput().click();
        selectors.getTimeInput().should('have.value', pair[1]);
      });
    });

    it('should show the correct date regardless of the time and timezone #1', () => {
      cy.setInitialValue('2022-11-01T00:00+02:00');
      openPage();

      selectors.getDateInput().should('have.value', '01 Nov 2022');
      selectors.getTimeInput().should('have.value', '00:00');
      selectors.getTimezoneInput().should('have.value', '+02:00');

      selectors.getCalendarTrigger().click();

      selectors.getCalendar().should('be.visible');
      selectors.getCalendarYear().should('have.value', '2022');
      selectors.getCalendarMonth().should('have.value', '10');
      selectors.getCalendarSelectedDate().should('have.text', '1');
    });

    it('should show the correct date regardless of the time and timezone #2', () => {
      cy.setInitialValue('2022-11-01T00:00+12:00');
      openPage();

      selectors.getDateInput().should('have.value', '01 Nov 2022');
      selectors.getTimeInput().should('have.value', '00:00');
      selectors.getTimezoneInput().should('have.value', '+12:00');

      selectors.getCalendarTrigger().click();

      selectors.getCalendar().should('be.visible');
      selectors.getCalendarYear().should('have.value', '2022');
      selectors.getCalendarMonth().should('have.value', '10');
      selectors.getCalendarSelectedDate().should('have.text', '1');
    });
  });

  describe('without timezone and with AM/PM', () => {
    beforeEach(() => {
      cy.setInstanceParams({
        format: 'time',
        ampm: '12',
      });
    });

    it('should read initial value', () => {
      cy.setInitialValue('1990-01-03T22:53+03:00');
      openPage();

      selectors.getDateInput().should('have.value', '03 Jan 1990');
      selectors.getTimeInput().should('have.value', '10:53 PM');
      selectors.getTimezoneInput().should('not.exist');

      selectors.getCalendarTrigger().click();

      selectors.getCalendar().should('be.visible');
      selectors.getCalendarYear().should('have.value', '1990');
      selectors.getCalendarMonth().should('have.value', '0');
      selectors.getCalendarSelectedDate().should('have.text', '3');
    });

    it('should parse values in time input', () => {
      openPage();
      selectors.getTimeInput().should('have.value', '12:00 AM');

      const pairs = [
        ['3 PM', '03:00 PM'],
        ['1:01', '01:01 AM'],
        ['5', '05:00 AM'],
        ['99', '12:00 AM'],
        ['asdasd', '12:00 AM'],
        ['9:43', '09:43 AM'],
      ];

      pairs.forEach((pair) => {
        selectors.getTimeInput().type(pair[0]);
        // blur doesn't work inside the iframe so clicking a different element instead
        selectors.getDateInput().click();
        selectors.getTimeInput().should('have.value', pair[1]);
      });
    });

    it('correct actions are called when user interacts with editor', () => {
      openPage();

      selectors.getCalendarTrigger().click();
      selectors.getCalendarTodayDate().click();
      selectors.getDateInput().should('have.value', getTodayShortString());

      selectors.getTimeInput().focus().type('3:00 PM');
      selectors.getDateInput().click();
      selectors.getTimeInput().should('have.value', '03:00 PM');

      selectors.getClearBtn().click();

      selectors.getDateInput().should('have.value', '');
      selectors.getTimeInput().should('have.value', '12:00 AM');
      selectors.getClearBtn().should('not.exist');

      cy.editorEvents().should('deep.equal', [
        { id: 6, type: 'onValueChanged', value: undefined },
        { id: 5, type: 'removeValue', value: undefined },
        { id: 4, type: 'onValueChanged', value: getTodayKebabString() + 'T15:00' },
        { id: 3, type: 'setValue', value: getTodayKebabString() + 'T15:00' },
        { id: 2, type: 'onValueChanged', value: getTodayKebabString() + 'T00:00' },
        { id: 1, type: 'setValue', value: getTodayKebabString() + 'T00:00' },
      ]);
    });

    it('should reset field state on external change', () => {
      cy.setInitialValue('1990-01-03T22:53');

      openPage();

      selectors.getDateInput().should('have.value', '03 Jan 1990');
      selectors.getTimeInput().should('have.value', '10:53 PM');

      cy.setValueExternal('1992-01-03T21:40');

      cy.wait(500);

      selectors.getDateInput().should('have.value', '03 Jan 1992');
      selectors.getTimeInput().should('have.value', '09:40 PM');
    });
  });

  describe('without timezone and time', () => {
    beforeEach(() => {
      cy.setInstanceParams({
        format: 'dateonly',
      });
    });

    it('should read initial value', () => {
      cy.setInitialValue('1990-01-03T22:53');
      openPage();

      selectors.getDateInput().should('have.value', '03 Jan 1990');
      selectors.getTimeInput().should('not.exist');
      selectors.getTimezoneInput().should('not.exist');

      selectors.getCalendarTrigger().click();

      selectors.getCalendar().should('be.visible');
      selectors.getCalendarYear().should('have.value', '1990');
      selectors.getCalendarMonth().should('have.value', '0');
      selectors.getCalendarSelectedDate().should('have.text', '3');
    });

    it('correct actions are called when user interacts with editor', () => {
      openPage();

      selectors.getCalendarTrigger().click();
      selectors.getCalendarTodayDate().click();
      selectors
        .getDateInput()
        .should('have.value', `${getToday().date} ${MONTHS[getToday().month]} ${getToday().year}`);

      selectors.getClearBtn().click();

      selectors.getDateInput().should('have.value', '');
      selectors.getClearBtn().should('not.exist');

      cy.editorEvents().should('deep.equal', [
        { id: 4, type: 'onValueChanged', value: undefined },
        { id: 3, type: 'removeValue', value: undefined },
        {
          id: 2,
          type: 'onValueChanged',
          value: getTodayKebabString(),
        },
        {
          id: 1,
          type: 'setValue',
          value: getTodayKebabString(),
        },
      ]);
    });

    it('should reset field state on external change', () => {
      cy.setInitialValue('1990-01-03');

      openPage();

      selectors.getDateInput().should('have.value', '03 Jan 1990');

      cy.setValueExternal('1992-01-03');

      selectors.getDateInput().should('have.value', '03 Jan 1992');
    });
  });
});
