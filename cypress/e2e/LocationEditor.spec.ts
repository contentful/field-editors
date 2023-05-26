import { getIframe } from '../fixtures/utils';

describe('Location Editor', () => {
  const LOCATION = {
    address: 'Max-Urich-Straße 1, 13355 Berlin, Germany',
    value: { lon: 13.38381, lat: 52.53885 },
  };

  const selectors = {
    getAddressRadio: () => {
      return getIframe().findByTestId('location-editor-address-radio').find('input');
    },
    getCoordinatesRadio: () => {
      return getIframe().findByTestId('location-editor-coordinates-radio').find('input');
    },
    getSearchInput: () => {
      return getIframe().findByTestId('location-editor-search');
    },
    getClearBtn: () => {
      return getIframe().findByTestId('location-editor-clear');
    },
    getLatitudeInput: () => {
      return getIframe().findByTestId('location-editor-latitude');
    },
    getLongitudeInput: () => {
      return getIframe().findByTestId('location-editor-longitude');
    },
    getLocationSuggestion: () => {
      return getIframe().findByTestId('location-editor-suggestion');
    },
    getValidationError: () => {
      return getIframe().findByTestId('location-editor-not-found');
    },
  };

  beforeEach(() => {
    cy.setGoogleMapsKey();
    cy.visit('/?path=/docs/editors-location--docs');
    getIframe().findByTestId('location-editor-integration-test').should('be.visible');
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
    cy.mockGoogleMapsResponse(require('../fixtures/maps-by-coordinates.json'));
    cy.editorEvents().should('deep.equal', []);

    selectors.getCoordinatesRadio().click();

    selectors.getLatitudeInput().type(LOCATION.value.lat.toString(), { delay: 0 });
    cy.wait(500);

    cy.editorEvents().should('deep.equal', [
      { id: 2, type: 'onValueChanged', value: { lon: 0, lat: LOCATION.value.lat } },
      { id: 1, type: 'setValue', value: { lon: 0, lat: LOCATION.value.lat } },
    ]);

    selectors.getLongitudeInput().type(LOCATION.value.lon.toString(), { delay: 0 });

    selectors.getAddressRadio().click();
    cy.wait(500);

    selectors.getSearchInput().should('have.value', LOCATION.address);

    cy.editorEvents().should('have.length', 4);
    cy.editorEvents(2).should('deep.equal', [
      { id: 4, type: 'onValueChanged', value: LOCATION.value },
      { id: 3, type: 'setValue', value: LOCATION.value },
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
    cy.mockGoogleMapsResponse(require('../fixtures/maps-by-address.json'));
    cy.editorEvents().should('deep.equal', []);

    selectors.getSearchInput().type(LOCATION.address);
    cy.wait(1000);
    selectors.getLocationSuggestion().click();
    cy.wait(500);

    selectors.getCoordinatesRadio().click();

    selectors.getLatitudeInput().should('have.value', LOCATION.value.lat.toString());
    selectors.getLongitudeInput().should('have.value', LOCATION.value.lon.toString());

    cy.editorEvents().should('deep.equal', [
      { id: 2, type: 'onValueChanged', value: LOCATION.value },
      { id: 1, type: 'setValue', value: LOCATION.value },
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
