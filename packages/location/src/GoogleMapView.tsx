/* eslint-disable @typescript-eslint/no-explicit-any */

import React from 'react';

import { css } from 'emotion';
import GoogleMapReact from 'google-map-react';

import { Coords } from './types';

const styles = {
  root: css({
    height: '300px',
    width: '100%',
  }),
};

const BerlinLocation = {
  lat: 52.5018,
  lng: 13.41115439,
};

type GoogleMapViewProps = {
  disabled: boolean;
  location: Coords | undefined;
  onGoogleApiLoaded: ({ maps }: { maps: any }) => void;
  onChangeLocation: (location: Coords) => void;
  googleMapsKey?: string;
};

type GoogleMapsViewState = {
  marker: any;
  maps: any;
};

export class GoogleMapView extends React.Component<GoogleMapViewProps, GoogleMapsViewState> {
  constructor(props: GoogleMapViewProps) {
    super(props);
    this.state = {
      marker: undefined,
      maps: undefined,
    };
  }

  componentDidUpdate() {
    if (this.state.marker && this.state.maps) {
      if (this.props.location) {
        const latLng = new this.state.maps.LatLng(this.props.location.lat, this.props.location.lng);
        this.state.marker.setPosition(latLng);
        this.state.marker.setVisible(true);
      } else {
        this.state.marker.setVisible(false);
      }
      this.state.marker.setDraggable(!this.props.disabled);
      this.state.marker.setCursor(this.props.disabled ? 'not-allowed' : 'auto');
    }
  }

  onGoogleApiLoaded = (event: { maps: any; map: any }) => {
    const { maps, map } = event;
    const marker = new maps.Marker({
      map,
      position: map.getCenter(),
      cursor: this.props.disabled ? 'not-allowed' : 'auto',
      draggable: !this.props.disabled,
      visible: Boolean(this.props.location),
    });

    maps.event.addListener(map, 'click', (event: any) => {
      if (this.props.disabled || !this.state.marker || !this.state.maps) {
        return;
      }
      this.state.marker.setPosition(event.latLng);
      this.state.marker.setVisible(true);
      this.props.onChangeLocation({
        lat: event.latLng.lat(),
        lng: event.latLng.lng(),
      });
    });

    maps.event.addListener(marker, 'dragend', (event: any) => {
      this.props.onChangeLocation({
        lat: event.latLng.lat(),
        lng: event.latLng.lng(),
      });
    });
    this.setState({ marker, maps }, () => {
      this.props.onGoogleApiLoaded({ maps });
    });
  };

  render() {
    return (
      <div className={styles.root}>
        <GoogleMapReact
          draggable={!this.props.disabled}
          bootstrapURLKeys={
            this.props.googleMapsKey ? { key: this.props.googleMapsKey } : undefined
          }
          defaultCenter={BerlinLocation}
          center={this.props.location}
          options={{
            scrollwheel: false,
            mapTypeId: 'roadmap',
          }}
          defaultZoom={6}
          yesIWantToUseGoogleMapApiInternals
          onGoogleApiLoaded={this.onGoogleApiLoaded}
        />
      </div>
    );
  }
}
