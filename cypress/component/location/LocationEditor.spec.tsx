import * as React from 'react';

import { createFakeFieldAPI } from '@contentful/field-editor-test-utils';

import { LocationEditor } from '../../../packages/location/src';
import { mount } from '../mount';

const renderLocationEditor = (isInitiallyDisabled = false) => {
  const [fieldSdk] = createFakeFieldAPI();
  mount(<LocationEditor field={fieldSdk} isInitiallyDisabled={isInitiallyDisabled} />);
  return fieldSdk;
};
describe('Location Editor', () => {
  const LOCATION = {
    address: 'Max-Urich-Straße 1, 13355 Berlin, Germany',
    value: { lon: 13.38381, lat: 52.53885 },
  };

  const selectors = {
    getAddressRadio: () => {
      return cy.findByRole('radio', { name: 'Address' });
    },
    getCoordinatesRadio: () => {
      return cy.findByRole('radio', { name: 'Coordinates' });
    },
    getSearchInput: () => {
      return cy.findByTestId('location-editor-search');
    },
    getClearBtn: () => {
      return cy.findByRole('button', { name: 'Clear' });
    },
    getLatitudeInput: () => {
      return cy.findByRole('spinbutton', { name: 'Latitude' });
    },
    getLongitudeInput: () => {
      return cy.findByRole('spinbutton', { name: 'Longitude' });
    },
    getLocationSuggestion: () => {
      return cy.findByTestId('location-editor-suggestion');
    },
    getValidationError: () => {
      return cy.findByTestId('location-editor-not-found');
    },
  };
  it('should have a proper default state', () => {
    const fieldSdk = renderLocationEditor();
    cy.spy(fieldSdk, 'setValue').as('setValue');

    selectors.getAddressRadio().should('be.checked');
    selectors.getCoordinatesRadio().should('not.be.checked');
    selectors.getSearchInput().should('be.empty');
    selectors.getClearBtn().should('exist');

    selectors.getCoordinatesRadio().click();

    selectors.getLongitudeInput().should('be.empty');
    selectors.getLatitudeInput().should('be.empty');
    selectors.getClearBtn().should('exist');

    cy.get('@setValue').should('not.be.called');
  });

  it('should set value after latitude and longitude change', () => {
    const fieldSdk = renderLocationEditor();
    cy.spy(fieldSdk, 'setValue').as('setValue');
    cy.spy(fieldSdk, 'removeValue').as('removeValue');

    cy.mockGoogleMapsResponse(require('../../fixtures/maps-by-coordinates.json'));

    selectors.getCoordinatesRadio().click();

    selectors.getLatitudeInput().type(LOCATION.value.lat.toString(), { delay: 0 });

    cy.get('@setValue').should('be.calledWith', { lon: 0, lat: LOCATION.value.lat });

    selectors.getLongitudeInput().type(LOCATION.value.lon.toString(), { delay: 0 });

    cy.get('@setValue').should('be.calledWith', LOCATION.value);

    selectors.getAddressRadio().click();

    selectors.getSearchInput().should('have.value', LOCATION.address);

    selectors.getSearchInput().clear();

    cy.get('@removeValue').should('be.called');
  });

  it('should set value after using search input', () => {
    const fieldSdk = renderLocationEditor();
    cy.spy(fieldSdk, 'setValue').as('setValue');
    cy.spy(fieldSdk, 'removeValue').as('removeValue');

    cy.mockGoogleMapsResponse(require('../../fixtures/maps-by-address.json'));

    selectors.getSearchInput().type(LOCATION.address);
    selectors.getLocationSuggestion().click();

    selectors.getCoordinatesRadio().click();

    selectors.getLatitudeInput().should('have.value', LOCATION.value.lat.toString());
    selectors.getLongitudeInput().should('have.value', LOCATION.value.lon.toString());

    cy.get('@setValue').should('be.calledWith', LOCATION.value);

    selectors.getAddressRadio().click();
    selectors.getClearBtn().click();

    cy.get('@removeValue').should('be.called');
  });

  it('should disable all elements if isDisabled is true', () => {
    renderLocationEditor(true);

    selectors.getSearchInput().should('be.disabled');
    selectors.getAddressRadio().should('be.disabled');
    selectors.getCoordinatesRadio().should('be.disabled');
    selectors.getClearBtn().should('be.disabled');
  });
});
