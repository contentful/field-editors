describe('Date Editor', () => {
  // February 15, 2019 timestamp
  const now = new Date(2019, 1, 15);

  const selectors = {
    getDateInput: () => {
      return cy.findByTestId('date-input');
    },
    getTimeInput: () => {
      return cy.findByTestId('time-input');
    },
    getTimezoneInput: () => {
      return cy.findByTestId('timezone-input');
    },
    getClearBtn: () => {
      return cy.findByTestId('date-clear');
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
      selectors.getClearBtn().should('be.disabled');
    });
  });

  describe('default configuration', () => {
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
        .should('have.value', '+01:00');
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

      selectors.getDateInput().click();
      selectors.getCalendarTodayDate().click();
      selectors
        .getDateInput()
        .blur()
        .should('have.value', 'Friday, February 15th 2019');

      selectors
        .getTimeInput()
        .type('15:00')
        .blur()
        .should('have.value', '15:00');

      selectors
        .getTimezoneInput()
        .select('+08:00')
        .blur()
        .should('have.value', '+08:00');

      cy.editorEvents().should('have.length', 6);

      cy.editorEvents().should('deep.equal', [
        { id: 6, type: 'onValueChanged', value: '2019-02-15T03:00+08:00' },
        { id: 5, type: 'setValue', value: '2019-02-15T03:00+08:00' },
        { id: 4, type: 'onValueChanged', value: '2019-02-15T03:00+01:00' },
        { id: 3, type: 'setValue', value: '2019-02-15T03:00+01:00' },
        { id: 2, type: 'onValueChanged', value: '2019-02-15T00:00+01:00' },
        { id: 1, type: 'setValue', value: '2019-02-15T00:00+01:00' }
      ]);
    });
  });
});
