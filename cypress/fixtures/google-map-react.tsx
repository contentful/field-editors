import * as React from 'react';

import type { Coords, GeocodeApiResponse } from '../../packages/location/src/types';

// Tests stub this method with fixture results; each test's Cypress sandbox restores it.
export class Geocoder {
  geocode(_request: unknown, callback: (results: GeocodeApiResponse) => void) {
    callback([]);
  }
}

class LatLng {
  constructor(
    private latitude: number,
    private longitude: number
  ) {}

  lat() {
    return this.latitude;
  }

  lng() {
    return this.longitude;
  }
}

function createMaps() {
  return {
    Geocoder,
    LatLng,
    Marker: Cypress.sinon.stub().returns({
      setPosition: Cypress.sinon.stub(),
      setVisible: Cypress.sinon.stub(),
      setDraggable: Cypress.sinon.stub(),
      setCursor: Cypress.sinon.stub()
    }),
    event: { addListener: Cypress.sinon.stub() }
  };
}

type MapAPI = {
  maps: ReturnType<typeof createMaps>;
  map: { getCenter: () => LatLng };
};

export default function GoogleMapReactMock({
  defaultCenter,
  onGoogleApiLoaded
}: {
  defaultCenter: Coords;
  onGoogleApiLoaded: (api: MapAPI) => void;
}) {
  const [api] = React.useState(() => ({
    maps: createMaps(),
    map: { getCenter: () => new LatLng(defaultCenter.lat, defaultCenter.lng) }
  }));

  React.useEffect(() => {
    onGoogleApiLoaded(api);
  }, [api, onGoogleApiLoaded]);

  return null;
}
