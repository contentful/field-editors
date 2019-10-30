export { Coords } from 'google-map-react';

export type LocationValue = { lat: number; lon: number };
export type NullableLocationValue = LocationValue | null | undefined;

export enum ViewType {
  Address = 'Address',
  Coordinates = 'Coordinates'
}

export type GeocodeApiResponse = null | Array<{
  formatted_address: string;
  geometry: {
    location: {
      lat: () => number;
      lng: () => number;
    };
  };
}>;
