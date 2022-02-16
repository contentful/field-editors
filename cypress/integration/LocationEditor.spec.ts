const LOCATION_1 = {
  address: 'Platz d. Deutschen Einheit 1, 20457 Hamburg, Germany',
  value: { lon: 9.98413, lat: 53.54132 },
};
const LOCATION_2 = {
  address: 'Max-Urich-Straße 1, 13355 Berlin, Germany',
  value: { lon: 13.38372, lat: 52.53926 },
};

describe('Location Editor', () => {
  const selectors = {
    getAddressRadio: () => {
      return cy.findByTestId('location-editor-address-radio').find('input');
    },
    getCoordinatesRadio: () => {
      return cy.findByTestId('location-editor-coordinates-radio').find('input');
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
    },
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

  // TODO: Why are we skipping this test?
  // eslint-disable-next-line mocha/no-skipped-tests
  it.skip('should set value after latitude and longitude change', () => {
    cy.editorEvents().should('deep.equal', []);

    selectors.getCoordinatesRadio().click();

    selectors.getLatitudeInput().type(LOCATION_1.value.lat.toString(), { delay: 0 });
    cy.wait(500);

    cy.editorEvents().should('deep.equal', [
      { id: 2, type: 'onValueChanged', value: { lon: 0, lat: LOCATION_1.value.lat } },
      { id: 1, type: 'setValue', value: { lon: 0, lat: LOCATION_1.value.lat } },
    ]);

    selectors.getLongitudeInput().type(LOCATION_1.value.lon.toString(), { delay: 0 });

    selectors.getAddressRadio().click();
    cy.wait(500);

    selectors.getSearchInput().should('have.value', LOCATION_1.address);

    cy.editorEvents().should('have.length', 4);
    cy.editorEvents(2).should('deep.equal', [
      { id: 4, type: 'onValueChanged', value: LOCATION_1.value },
      { id: 3, type: 'setValue', value: LOCATION_1.value },
    ]);

    selectors.getSearchInput().clear();

    cy.wait(500);

    cy.editorEvents().should('have.length', 6);
    cy.editorEvents(2).should('deep.equal', [
      { id: 6, type: 'onValueChanged', value: undefined },
      { id: 5, type: 'removeValue', value: undefined },
    ]);
  });

  it('should set value after using search input', () => {
    cy.mockGoogleMapsResponse(require('../fixtures/map-search-address-reply.json'));
    cy.editorEvents().should('deep.equal', []);

    selectors.getSearchInput().type(LOCATION_2.address);
    cy.wait(1000);
    selectors.getLocationSuggestion().click();
    cy.wait(500);

    selectors.getCoordinatesRadio().click();

    selectors.getLatitudeInput().should('have.value', LOCATION_2.value.lat.toString());
    selectors.getLongitudeInput().should('have.value', LOCATION_2.value.lon.toString());

    cy.editorEvents().should('deep.equal', [
      { id: 2, type: 'onValueChanged', value: LOCATION_2.value },
      { id: 1, type: 'setValue', value: LOCATION_2.value },
    ]);

    selectors.getAddressRadio().click();
    selectors.getClearBtn().click();
    cy.wait(500);

    cy.editorEvents().should('have.length', 4);
    cy.editorEvents(2).should('deep.equal', [
      { id: 4, type: 'onValueChanged', value: undefined },
      { id: 3, type: 'removeValue', value: undefined },
    ]);
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
