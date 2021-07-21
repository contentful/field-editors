import React from 'react';
import { css } from 'emotion';
import tokens from '@contentful/forma-36-tokens';
import {
  RadioButtonField,
  FieldGroup,
  TextInput,
  TextLink,
} from '@contentful/forma-36-react-components';
import { LocationSearchInput } from './LocationSearchInput';

import { Coords, ViewType, GeocodeApiResponse } from './types';

interface LocationSelectorProps {
  disabled: boolean;
  value: Coords | undefined;
  view: ViewType;
  onChangeView: (view: ViewType) => void;
  onChangeLocation: (value?: Coords) => void;
  onSearchAddress: (value: string) => Promise<GeocodeApiResponse>;
  onGetAddressFromLocation: (location: Coords | undefined, address: string) => Promise<string>;
}

const styles = {
  root: css({
    display: 'flex',
    flexDirection: 'row',
    marginTop: tokens.spacingS,
    alignItems: 'flex-end',
  }),
  main: css({
    flexGrow: 1,
  }),
  secondary: css({
    minWidth: '70px',
    textAlign: 'right',
  }),
  inputsRow: css({
    display: 'flex',
    marginTop: tokens.spacingS,
    fontSize: tokens.fontSizeM,
    color: tokens.gray900,
    fontFamily: tokens.fontStackPrimary,
    alignItems: 'center',
  }),
  splitter: css({
    width: tokens.spacingL,
  }),
  clearBtn: css({
    marginBottom: tokens.spacingS,
  }),
};

export function LocationSelector(props: LocationSelectorProps) {
  return (
    <div className={styles.root}>
      <div className={styles.main}>
        <FieldGroup row>
          <RadioButtonField
            labelText="Address"
            labelIsLight
            disabled={props.disabled}
            id={ViewType.Address}
            value={ViewType.Address}
            onChange={() => {
              props.onChangeView(ViewType.Address);
            }}
            inputProps={{
              testId: 'location-editor-address-radio',
            }}
            checked={props.view === ViewType.Address}
          />
          <RadioButtonField
            labelText="Coordinates"
            labelIsLight
            disabled={props.disabled}
            id={ViewType.Coordinates}
            value={ViewType.Coordinates}
            onChange={() => {
              props.onChangeView(ViewType.Coordinates);
            }}
            inputProps={{
              testId: 'location-editor-coordinates-radio',
            }}
            checked={props.view === ViewType.Coordinates}
          />
        </FieldGroup>
        {props.view === ViewType.Address && (
          <div className={styles.inputsRow}>
            <LocationSearchInput
              onSearchAddress={props.onSearchAddress}
              onGetAddressFromLocation={props.onGetAddressFromLocation}
              disabled={props.disabled}
              value={props.value}
              onChangeLocation={props.onChangeLocation}
            />
          </div>
        )}
        {props.view === ViewType.Coordinates && (
          <div className={styles.inputsRow}>
            <label htmlFor="latitude">Latitude</label>
            <div className={styles.splitter} />
            <TextInput
              id="latitude"
              testId="location-editor-latitude"
              placeholder="Between -90 and 90"
              disabled={props.disabled}
              value={props.value ? String(props.value.lat) : ''}
              onChange={(e) => {
                props.onChangeLocation({
                  lng: props.value && props.value.lng !== undefined ? props.value.lng : 0,
                  lat: Number(e.target.value) || 0,
                });
              }}
              type="number"
              max="90"
              min="-90"
              step="0.1"
            />
            <div className={styles.splitter} />
            <label htmlFor="longitude">Longitude</label>
            <div className={styles.splitter} />
            <TextInput
              id="longitude"
              testId="location-editor-longitude"
              placeholder="Between -180 and 180"
              disabled={props.disabled}
              value={props.value ? String(props.value.lng) : ''}
              onChange={(e) => {
                props.onChangeLocation({
                  lat: props.value && props.value.lat !== undefined ? props.value.lat : 0,
                  lng: Number(e.target.value) || 0,
                });
              }}
              type="number"
              max="180"
              min="-180"
              step="0.1"
            />
          </div>
        )}
      </div>
      <div className={styles.secondary}>
        <TextLink
          disabled={props.disabled}
          testId="location-editor-clear"
          className={styles.clearBtn}
          onClick={() => {
            props.onChangeLocation(undefined);
          }}>
          Clear
        </TextLink>
      </div>
    </div>
  );
}
