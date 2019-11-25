describe('Date Editor', () => {
  // February 15, 2019 timestamp
  const now = new Date(2019, 1, 15);

  const selectors = {
    getDateInput: () => {
      return cy.findByTestId('date-input');
    },
    getTimeInput: () => {
      return cy.queryByTestId('time-input');
    },
    getTimezoneInput: () => {
      return cy.queryByTestId('timezone-input');
    },
    getClearBtn: () => {
      return cy.queryByTestId('date-clear');
    },
    getCalendar: () => {
      return cy.get('.pika-lendar');
    },
    getCalendarMonth: () => {
      return cy.get('.pika-lendar .pika-select-month');
    },
    getCalendarYear: () => {
      return cy.get('.pika-lendar .pika-select-year');
    },
    getCalendarTodayDate: () => {
      return cy.get('.pika-lendar .is-today');
    },
    getCalendarSelectedDate: () => {
      return cy.get('.pika-lendar .is-selected');
    }
  };

  const getToday = () => {
    const month = now.getMonth();
    const year = now.getFullYear();
    const date = now.getDate();
    return {
      month,
      year,
      date
    };
  };

  const openPage = () => {
    cy.visit('/date');
    cy.findByTestId('date-editor-integration-test').should('be.visible');
  };

  beforeEach(() => {
    cy.clock(now.getTime());
  });

  describe('disabled state', () => {
    it('all fields should be disabled', () => {
      cy.setInitialDisabled(true);
      openPage();

      selectors.getDateInput().should('be.disabled');
      selectors.getTimeInput().should('be.disabled');
      selectors.getTimezoneInput().should('be.disabled');
      selectors.getClearBtn().should('not.be.visible');
    });
  });

  describe('default configuration', () => {
    it('should read initial value', () => {
      cy.setInitialValue('2018-01-03T05:53+03:00');
      openPage();

      selectors.getDateInput().should('have.value', 'Wednesday, January 3rd 2018');
      selectors.getTimeInput().should('have.value', '05:53');
      selectors.getTimezoneInput().should('have.value', '+03:00');
    });

    it('should render date, time (24 format) and timezone inputs by default', () => {
      openPage();

      selectors
        .getDateInput()
        .should('be.visible')
        .should('have.value', '');
      selectors
        .getTimeInput()
        .should('be.visible')
        .should('have.attr', 'date-time-type', '24')
        .should('have.attr', 'placeholder', '00:00')
        .should('have.value', '00:00');
      selectors
        .getTimezoneInput()
        .should('be.visible')
        .should('have.value', '+00:00');
    });

    it('calendar should show current year, month and date', () => {
      openPage();
      const { year, month, date } = getToday();

      selectors.getDateInput().click();

      selectors.getCalendar().should('be.visible');
      selectors.getCalendarYear().should('have.value', year.toString());
      selectors.getCalendarMonth().should('have.value', month.toString());
      selectors.getCalendarTodayDate().should('have.text', date.toString());
      selectors.getCalendarSelectedDate().should('not.be.visible');
    });

    it('correct actions are called when user interacts with editor', () => {
      openPage();
      selectors
        .getTimezoneInput()
        .select('+08:00')
        .blur()
        .should('have.value', '+08:00');

      selectors.getDateInput().click();
      selectors.getCalendarTodayDate().click();
      selectors
        .getDateInput()
        .blur()
        .should('have.value', 'Friday, February 15th 2019');

      selectors
        .getTimeInput()
        .focus()
        .type('15:00')
        .blur()
        .should('have.value', '15:00');

      selectors.getClearBtn().click();

      // it is necessary cause we mock cypress.clock
      cy.tick(1000);

      selectors.getDateInput().should('have.value', '');
      selectors.getTimeInput().should('have.value', '00:00');
      selectors.getTimezoneInput().should('have.value', '+00:00');
      selectors.getClearBtn().should('not.be.visible');

      cy.editorEvents().should('deep.equal', [
        { id: 6, type: 'onValueChanged', value: undefined },
        { id: 5, type: 'removeValue', value: undefined },
        { id: 4, type: 'onValueChanged', value: '2019-02-15T03:00+08:00' },
        { id: 3, type: 'setValue', value: '2019-02-15T03:00+08:00' },
        { id: 2, type: 'onValueChanged', value: '2019-02-15T00:00+08:00' },
        { id: 1, type: 'setValue', value: '2019-02-15T00:00+08:00' }
      ]);
    });

    it('should reset field state on external change', () => {
      cy.setInitialValue('1990-01-03T22:53+03:00');

      openPage();

      selectors.getDateInput().should('have.value', 'Wednesday, January 3rd 1990');
      selectors.getTimeInput().should('have.value', '22:53');
      selectors.getTimezoneInput().should('have.value', '+03:00');

      cy.setValueExternal('1992-01-03T21:40+05:00');

      selectors.getDateInput().should('have.value', 'Friday, January 3rd 1992');
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
        ['9:43 AM', '09:43']
      ];

      pairs.forEach(pair => {
        selectors
          .getTimeInput()
          .type(pair[0])
          .blur()
          .should('have.value', pair[1]);
      });
    });
  });

  describe('without timezone and with AM/PM', () => {
    beforeEach(() => {
      cy.setInstanceParams({
        format: 'time',
        ampm: '12'
      });
    });

    it('should read initial value', () => {
      cy.setInitialValue('1990-01-03T22:53+03:00');
      openPage();

      selectors.getDateInput().should('have.value', 'Wednesday, January 3rd 1990');
      selectors.getTimeInput().should('have.value', '10:53 PM');
      selectors.getTimezoneInput().should('not.be.visible');

      selectors.getDateInput().click();

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
        ['9:43', '09:43 AM']
      ];

      pairs.forEach(pair => {
        selectors
          .getTimeInput()
          .type(pair[0])
          .blur()
          .should('have.value', pair[1]);
      });
    });

    it('correct actions are called when user interacts with editor', () => {
      openPage();

      selectors.getDateInput().click();
      selectors.getCalendarTodayDate().click();
      selectors
        .getDateInput()
        .blur()
        .should('have.value', 'Friday, February 15th 2019');

      selectors
        .getTimeInput()
        .focus()
        .type('3:00 PM')
        .blur()
        .should('have.value', '03:00 PM');

      selectors.getClearBtn().click();

      // it is necessary cause we mock cypress.clock
      cy.tick(1000);

      selectors.getDateInput().should('have.value', '');
      selectors.getTimeInput().should('have.value', '12:00 AM');
      selectors.getClearBtn().should('not.be.visible');

      cy.editorEvents().should('deep.equal', [
        { id: 6, type: 'onValueChanged', value: undefined },
        { id: 5, type: 'removeValue', value: undefined },
        { id: 4, type: 'onValueChanged', value: '2019-02-15T15:00' },
        { id: 3, type: 'setValue', value: '2019-02-15T15:00' },
        { id: 2, type: 'onValueChanged', value: '2019-02-15T00:00' },
        { id: 1, type: 'setValue', value: '2019-02-15T00:00' }
      ]);
    });

    it('should reset field state on external change', () => {
      cy.setInitialValue('1990-01-03T22:53');

      openPage();

      selectors.getDateInput().should('have.value', 'Wednesday, January 3rd 1990');
      selectors.getTimeInput().should('have.value', '10:53 PM');

      cy.setValueExternal('1992-01-03T21:40');

      selectors.getDateInput().should('have.value', 'Friday, January 3rd 1992');
      selectors.getTimeInput().should('have.value', '09:40 PM');
    });
  });

  describe('without timezone and time', () => {
    beforeEach(() => {
      cy.setInstanceParams({
        format: 'dateonly'
      });
    });

    it('should read initial value', () => {
      cy.setInitialValue('1990-01-03T22:53');
      openPage();

      selectors.getDateInput().should('have.value', 'Wednesday, January 3rd 1990');
      selectors.getTimeInput().should('not.be.visible');
      selectors.getTimezoneInput().should('not.be.visible');

      selectors.getDateInput().click();

      selectors.getCalendar().should('be.visible');
      selectors.getCalendarYear().should('have.value', '1990');
      selectors.getCalendarMonth().should('have.value', '0');
      selectors.getCalendarSelectedDate().should('have.text', '3');
    });

    it('correct actions are called when user interacts with editor', () => {
      openPage();

      selectors.getDateInput().click();
      selectors.getCalendarTodayDate().click();
      selectors
        .getDateInput()
        .blur()
        .should('have.value', 'Friday, February 15th 2019');

      selectors.getClearBtn().click();

      // it is necessary cause we mock cypress.clock
      cy.tick(1000);

      selectors.getDateInput().should('have.value', '');
      selectors.getClearBtn().should('not.be.visible');

      cy.editorEvents().should('deep.equal', [
        { id: 4, type: 'onValueChanged', value: undefined },
        { id: 3, type: 'removeValue', value: undefined },
        { id: 2, type: 'onValueChanged', value: '2019-02-15' },
        { id: 1, type: 'setValue', value: '2019-02-15' }
      ]);
    });

    it('should reset field state on external change', () => {
      cy.setInitialValue('1990-01-03');

      openPage();

      selectors.getDateInput().should('have.value', 'Wednesday, January 3rd 1990');

      cy.setValueExternal('1992-01-03');

      selectors.getDateInput().should('have.value', 'Friday, January 3rd 1992');
    });
  });
});
