import * as React from 'react';

import { FieldAPI, FieldConnector, ParametersAPI } from '@contentful/field-editor-shared';
import isNumber from 'lodash/isNumber';
import throttle from 'lodash/throttle';

import { GoogleMapView } from './GoogleMapView';
import { LocationSelector } from './LocationSelector';
import {
  LocationValue,
  ViewType,
  NullableLocationValue,
  Coords,
  GeocodeApiResponse,
} from './types';

export interface LocationEditorConnectedProps {
  /**
   * is the field disabled initially
   */
  isInitiallyDisabled: boolean;

  /**
   * sdk.field
   */
  field: FieldAPI;

  /**
   * sdk.parameters
   */
  parameters?: ParametersAPI<
    Record<string, any>,
    {
      googleMapsKey?: string;
    },
    Record<string, any>
  >;
}

type LocationEditorProps = {
  disabled: boolean;
  value: NullableLocationValue;
  setValue: (value: NullableLocationValue) => void;
  googleMapsKey?: string;
  selectedView: ViewType;
  setSelectedView: (view: ViewType) => void;
};

function toLocationValue(coords?: Coords): NullableLocationValue {
  if (coords && isNumber(coords.lat) && isNumber(coords.lng)) {
    return { lat: coords.lat, lon: coords.lng };
  } else {
    return null;
  }
}

export function LocationEditor({
  disabled,
  value,
  setValue,
  googleMapsKey,
  selectedView,
  setSelectedView,
}: LocationEditorProps) {
  const [localValue, setLocalValue] = React.useState<Coords | undefined>(() =>
    // if we have only the lon or lat set, we set the other to 0.
    // if both are not set, we set localValue to undefined.
    value?.lon || value?.lat
      ? {
          lng: value.lon ?? 0,
          lat: value.lat ?? 0,
        }
      : undefined,
  );
  // eslint-disable-next-line -- TODO: describe this disable  @typescript-eslint/no-explicit-any
  const [mapsObject, setMapsObject] = React.useState<any>(null);
  const mapsObjectRef = React.useRef(mapsObject);
  mapsObjectRef.current = mapsObject;

  const throttledSearchAddress = React.useMemo(
    () =>
      throttle((searchValue: string): Promise<GeocodeApiResponse> => {
        const currentMapsObject = mapsObjectRef.current;
        if (!currentMapsObject || !searchValue) {
          return Promise.resolve(null);
        }
        return new Promise((resolve) => {
          const geocoder = new currentMapsObject.Geocoder();
          geocoder.geocode({ address: searchValue }, resolve, () => {
            resolve(null);
          });
        });
      }, 300),
    [],
  );

  React.useEffect(() => () => throttledSearchAddress.cancel(), [throttledSearchAddress]);

  const onSearchAddress = (searchValue: string): Promise<GeocodeApiResponse> =>
    throttledSearchAddress(searchValue) ?? Promise.resolve(null);

  const onGetAddressFromLocation = (
    location: Coords | undefined,
    address: string,
  ): Promise<string> => {
    if (!mapsObject || !location) {
      return Promise.resolve('');
    }
    return new Promise((resolve) => {
      const geocoder = new mapsObject.Geocoder();
      geocoder.geocode(
        { location },
        (result: GeocodeApiResponse) => {
          if (result && result.length > 0) {
            const addresses = result.map((item) => item.formatted_address);
            resolve(addresses.find((item) => item === address) || addresses[0]);
          } else {
            resolve('');
          }
        },
        () => {
          resolve('');
        },
      );
    });
  };

  const onChangeLocation = (coords: Coords | undefined) => {
    setLocalValue(coords);
    setValue(toLocationValue(coords));
  };

  return (
    <div data-test-id="location-editor">
      <GoogleMapView
        disabled={disabled || mapsObject === null}
        googleMapsKey={googleMapsKey}
        location={localValue}
        onGoogleApiLoaded={({ maps }) => {
          setMapsObject(maps);
        }}
        onChangeLocation={onChangeLocation}
      />
      <LocationSelector
        disabled={disabled || mapsObject === null}
        value={localValue}
        view={selectedView}
        onChangeView={setSelectedView}
        onChangeLocation={onChangeLocation}
        onSearchAddress={onSearchAddress}
        onGetAddressFromLocation={onGetAddressFromLocation}
      />
    </div>
  );
}

export function LocationEditorConnected(props: LocationEditorConnectedProps) {
  const { field } = props;
  const googleMapsKey = props.parameters ? props.parameters.instance.googleMapsKey : undefined;
  const [selectedView, setSelectedView] = React.useState<ViewType>(ViewType.Address);

  return (
    <FieldConnector<LocationValue> field={field} isInitiallyDisabled={props.isInitiallyDisabled}>
      {({ value, disabled, setValue, externalReset }) => {
        return (
          <LocationEditor
            // on external change reset component completely and init with initial value again
            key={`location-editor-${externalReset}`}
            value={value}
            disabled={disabled}
            setValue={setValue}
            googleMapsKey={googleMapsKey}
            selectedView={selectedView}
            setSelectedView={setSelectedView}
          />
        );
      }}
    </FieldConnector>
  );
}

LocationEditorConnected.defaultProps = {
  isInitiallyDisabled: true,
};
