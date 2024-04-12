import * as React from 'react';

import { FieldAPI, FieldConnector, ParametersAPI } from '@contentful/field-editor-shared';
import deepEqual from 'deep-equal';
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

export class LocationEditor extends React.Component<
  LocationEditorProps,
  {
    localValue?: Coords;
    mapsObject: any; // eslint-disable-line -- TODO: describe this disable  @typescript-eslint/no-explicit-any
  }
> {
  constructor(props: LocationEditorProps) {
    super(props);

    this.state = {
      localValue:
        // if we have only the lon or lat set, we set the other to 0.
        // if both are not set, we set localValue to undefined.
        props?.value?.lon || props?.value?.lat
          ? {
              lng: props.value.lon ?? 0,
              lat: props.value.lat ?? 0,
            }
          : undefined,
      mapsObject: null,
    };
  }

  // @ts-expect-error
  onSearchAddress: (value: string) => Promise<GeocodeApiResponse> = throttle((value) => {
    if (!this.state.mapsObject) {
      return Promise.resolve(null);
    }
    const { mapsObject } = this.state;
    if (!value) {
      return Promise.resolve(null);
    }
    return new Promise((resolve) => {
      const geocoder = new mapsObject.Geocoder();
      geocoder.geocode({ address: value }, resolve, () => {
        resolve(null);
      });
    });
  }, 300);

  onGetAddressFromLocation = (location: Coords | undefined, value: string): Promise<string> => {
    if (!this.state.mapsObject || !location) {
      return Promise.resolve('');
    }
    const { mapsObject } = this.state;
    return new Promise((resolve) => {
      const geocoder = new mapsObject.Geocoder();
      geocoder.geocode(
        { location },
        (result: GeocodeApiResponse) => {
          if (result && result.length > 0) {
            const addresses = result.map((item) => item.formatted_address);
            resolve(addresses.find((item) => item === value) || addresses[0]);
          } else {
            resolve('');
          }
        },
        () => {
          resolve('');
        }
      );
    });
  };

  render() {
    const { mapsObject, localValue } = this.state;

    return (
      <div data-test-id="location-editor">
        <GoogleMapView
          disabled={this.props.disabled || mapsObject === null}
          googleMapsKey={this.props.googleMapsKey}
          location={localValue}
          onGoogleApiLoaded={({ maps }) => {
            this.setState({ mapsObject: maps });
          }}
          onChangeLocation={(coords) => {
            this.setState({ localValue: coords });
            this.props.setValue(toLocationValue(coords));
          }}
        />
        <LocationSelector
          disabled={this.props.disabled || mapsObject === null}
          value={localValue}
          view={this.props.selectedView}
          onChangeView={(view) => {
            this.props.setSelectedView(view);
          }}
          onChangeLocation={(coords) => {
            this.setState({ localValue: coords });
            this.props.setValue(toLocationValue(coords));
          }}
          onSearchAddress={this.onSearchAddress}
          onGetAddressFromLocation={this.onGetAddressFromLocation}
        />
      </div>
    );
  }
}

export function LocationEditorConnected(props: LocationEditorConnectedProps) {
  const { field } = props;
  const googleMapsKey = props.parameters ? props.parameters.instance.googleMapsKey : undefined;
  const [selectedView, setSelectedView] = React.useState<ViewType>(ViewType.Address);

  return (
    <FieldConnector<LocationValue>
      isEqualValues={(value1, value2) => {
        return deepEqual(value1, value2);
      }}
      field={field}
      isInitiallyDisabled={props.isInitiallyDisabled}
    >
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
