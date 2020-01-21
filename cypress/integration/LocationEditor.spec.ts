describe('Location Editor', () => {
  const selectors = {
    getAddressRadio: () => {
      return cy.findByTestId('location-editor-address-radio');
    },
    getCoordinatesRadio: () => {
      return cy.findByTestId('location-editor-coordinates-radio');
    },
    getSearchInput: () => {
      return cy.findByTestId('location-editor-search');
    },
    getClearBtn: () => {
      return cy.findByTestId('location-editor-clear');
    },
    getLatitudeInput: () => {
      return cy.findByTestId('location-editor-latitude');
    },
    getLongitudeInput: () => {
      return cy.findByTestId('location-editor-longitude');
    },
    getLocationSuggestion: () => {
      return cy.findByTestId('location-editor-suggestion');
    },
    getValidationError: () => {
      return cy.findByTestId('location-editor-not-found');
    }
  };

  beforeEach(() => {
    cy.setGoogleMapsKey();
    cy.visit('/location');
    cy.findByTestId('location-editor-integration-test').should('be.visible');
  });

  afterEach(() => {
    cy.setInitialValue(undefined);
    cy.setInitialDisabled(undefined);
  });

  it('should have a proper default state', () => {
    cy.editorEvents().should('deep.equal', []);

    selectors.getAddressRadio().should('be.checked');
    selectors.getCoordinatesRadio().should('not.be.checked');
    selectors.getSearchInput().should('be.empty');
    selectors.getClearBtn().should('exist');

    selectors.getCoordinatesRadio().click();

    selectors.getLongitudeInput().should('be.empty');
    selectors.getLatitudeInput().should('be.empty');
    selectors.getClearBtn().should('exist');

    cy.editorEvents().should('deep.equal', []);
  });

  it('should set value after latitude and longitude change', () => {
    cy.editorEvents().should('deep.equal', []);

    selectors.getCoordinatesRadio().click();

    selectors.getLatitudeInput().type('53.54132', { delay: 0 });
    cy.wait(500);
    selectors.getLongitudeInput().type('9.98413', { delay: 0 });

    selectors.getAddressRadio().click();
    cy.wait(500);

    selectors
      .getSearchInput()
      .should('have.value', 'Platz der Deutschen Einheit 1, 20457 Hamburg, Germany');

    cy.editorEvents().should('deep.equal', [
      { id: 4, type: 'onValueChanged', value: { lon: 9.98413, lat: 53.54132 } },
      { id: 3, type: 'setValue', value: { lon: 9.98413, lat: 53.54132 } },
      { id: 2, type: 'onValueChanged', value: { lon: 0, lat: 53.54132 } },
      { id: 1, type: 'setValue', value: { lon: 0, lat: 53.54132 } }
    ]);

    selectors.getSearchInput().clear();

    cy.wait(500);

    cy.editorEvents().should('deep.equal', [
      { id: 6, type: 'onValueChanged', value: undefined },
      { id: 5, type: 'removeValue', value: undefined },
      { id: 4, type: 'onValueChanged', value: { lon: 9.98413, lat: 53.54132 } },
      { id: 3, type: 'setValue', value: { lon: 9.98413, lat: 53.54132 } },
      { id: 2, type: 'onValueChanged', value: { lon: 0, lat: 53.54132 } },
      { id: 1, type: 'setValue', value: { lon: 0, lat: 53.54132 } }
    ]);
  });

  it('should set value after using search input', () => {
    cy.editorEvents().should('deep.equal', []);

    selectors.getSearchInput().type('Max-Urich-Straße 1, 13355 Berlin, Germany');
    cy.wait(1000);
    selectors.getLocationSuggestion().click();
    cy.wait(500);

    selectors.getCoordinatesRadio().click();

    selectors.getLatitudeInput().should('have.value', '52.5389');
    selectors.getLongitudeInput().should('have.value', '13.38369');

    cy.editorEvents().should('deep.equal', [
      { id: 2, type: 'onValueChanged', value: { lon: 13.38369, lat: 52.5389 } },
      { id: 1, type: 'setValue', value: { lon: 13.38369, lat: 52.5389 } }
    ]);

    selectors.getAddressRadio().click();
    selectors.getClearBtn().click();
    cy.wait(500);

    cy.editorEvents().should('deep.equal', [
      { id: 4, type: 'onValueChanged', value: undefined },
      { id: 3, type: 'removeValue', value: undefined },
      { id: 2, type: 'onValueChanged', value: { lon: 13.38369, lat: 52.5389 } },
      { id: 1, type: 'setValue', value: { lon: 13.38369, lat: 52.5389 } }
    ]);
  });

  it('should show validation error if address does not exist', () => {
    selectors.getSearchInput().type('something that clearly does not exist');
    cy.wait(500);
    selectors
      .getValidationError()
      .should(
        'have.text',
        'No results found for something that clearly does not exist. Please make sure that address is spelled correctly.'
      );
  });

  it('should disable all elements if isDisabled is true', () => {
    cy.setInitialDisabled(true);
    cy.reload();

    selectors.getSearchInput().should('be.disabled');
    selectors.getAddressRadio().should('be.disabled');
    selectors.getCoordinatesRadio().should('be.disabled');
    selectors.getClearBtn().should('be.disabled');
  });
});
