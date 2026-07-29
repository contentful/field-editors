/* eslint-disable @typescript-eslint/no-explicit-any */

import * as React from 'react';

import { css } from '@emotion/css';
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

export function GoogleMapView(props: GoogleMapViewProps) {
  const [marker, setMarker] = React.useState<any>();
  const [maps, setMaps] = React.useState<any>();
  const propsRef = React.useRef(props);
  propsRef.current = props;

  React.useEffect(() => {
    if (marker && maps) {
      if (props.location) {
        const latLng = new maps.LatLng(props.location.lat, props.location.lng);
        marker.setPosition(latLng);
        marker.setVisible(true);
      } else {
        marker.setVisible(false);
      }
      marker.setDraggable(!props.disabled);
      marker.setCursor(props.disabled ? 'not-allowed' : 'auto');
    }
  }, [marker, maps, props.disabled, props.location]);

  const handleGoogleApiLoaded = (event: { maps: any; map: any }) => {
    const { maps: loadedMaps, map } = event;
    const loadedMarker = new loadedMaps.Marker({
      map,
      position: map.getCenter(),
      cursor: propsRef.current.disabled ? 'not-allowed' : 'auto',
      draggable: !propsRef.current.disabled,
      visible: Boolean(propsRef.current.location),
    });

    loadedMaps.event.addListener(map, 'click', (event: any) => {
      if (propsRef.current.disabled) {
        return;
      }
      loadedMarker.setPosition(event.latLng);
      loadedMarker.setVisible(true);
      propsRef.current.onChangeLocation({
        lat: event.latLng.lat(),
        lng: event.latLng.lng(),
      });
    });

    loadedMaps.event.addListener(loadedMarker, 'dragend', (event: any) => {
      propsRef.current.onChangeLocation({
        lat: event.latLng.lat(),
        lng: event.latLng.lng(),
      });
    });
    setMarker(loadedMarker);
    setMaps(loadedMaps);
    propsRef.current.onGoogleApiLoaded({ maps: loadedMaps });
  };

  return (
    <div className={styles.root}>
      <GoogleMapReact
        draggable={!props.disabled}
        bootstrapURLKeys={props.googleMapsKey ? { key: props.googleMapsKey } : undefined}
        defaultCenter={BerlinLocation}
        center={props.location}
        options={{
          scrollwheel: false,
          mapTypeId: 'roadmap',
        }}
        defaultZoom={6}
        yesIWantToUseGoogleMapApiInternals
        onGoogleApiLoaded={handleGoogleApiLoaded}
      />
    </div>
  );
}
