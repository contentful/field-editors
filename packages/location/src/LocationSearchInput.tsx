import React from 'react';
import { css } from 'emotion';
import tokens from '@contentful/forma-36-tokens';
import { TextInput, ValidationMessage, DropdownList, DropdownListItem, Card } from '@contentful/forma-36-react-components';
import { Coords, GeocodeApiResponse } from './types';

import { Spinner } from "@contentful/f36-components";

const styles = {
  root: css({
    width: '100%',
  }),
  input: css({
    position: 'relative',
    width: '100%',
  }),
  spinner: css({
    position: 'absolute',
    right: 10,
    top: 10,
    zIndex: 99,
  }),
  validationMessage: css({
    marginTop: tokens.spacingS,
  }),
  suggesion: css({
    position: 'absolute',
    bottom: '-65px',
    left: 0,
    minWidth: '400px',
    zIndex: 1,
  }),
};

type LocationSearchInputProps = {
  disabled: boolean;
  value?: Coords;
  onSearchAddress: (term: string) => Promise<GeocodeApiResponse>;
  onGetAddressFromLocation: (coors: Coords | undefined, value: string) => Promise<string>;
  onChangeLocation: (location?: Coords) => void;
};

export function LocationSearchInput(props: LocationSearchInputProps) {
  const [isSearching, setIsSearching] = React.useState<boolean>(false);
  const [address, setAddress] = React.useState<string>('');
  const [hasError, setHasError] = React.useState<boolean>(false);
  const [suggestion, setSuggestion] =
    React.useState<null | {
      address: string;
      location: { lat: number; lng: number };
    }>(null);

  React.useEffect(() => {
    setIsSearching(true);
    props.onGetAddressFromLocation(props.value, address).then((address) => {
      setAddress(address);
      setIsSearching(false);
    });
  }, [props.value, props.disabled]);

  return (
    <div className={styles.root}>
      <div className={styles.input}>
        <TextInput
          testId="location-editor-search"
          error={hasError}
          placeholder="Start typing to find location"
          value={address}
          onChange={(e) => {
            setAddress(e.target.value);
            setHasError(false);
            setSuggestion(null);

            if (e.target.value === '') {
              props.onChangeLocation(undefined);
              return;
            }

            setIsSearching(true);
            props.onSearchAddress(e.target.value).then((value) => {
              setIsSearching(false);
              if (value === null) {
                setHasError(false);
              } else if (value.length === 0) {
                setHasError(true);
              } else {
                setHasError(false);
                setSuggestion({
                  address: value[0].formatted_address,
                  location: {
                    lat: Number(value[0].geometry.location.lat().toString().slice(0, 8)),
                    lng: Number(value[0].geometry.location.lng().toString().slice(0, 8)),
                  },
                });
              }
            });
          }}
          disabled={props.disabled}
        />
        {isSearching && <Spinner size="default" className={styles.spinner} />}
        {suggestion && (
          <Card padding="none" className={styles.suggesion}>
            <DropdownList>
              <DropdownListItem
                testId="location-editor-suggestion"
                onClick={() => {
                  setAddress(suggestion.address);
                  props.onChangeLocation(suggestion.location);
                  setSuggestion(null);
                }}>
                {suggestion.address}
              </DropdownListItem>
            </DropdownList>
          </Card>
        )}
        {hasError && (
          <ValidationMessage
            testId="location-editor-not-found"
            className={styles.validationMessage}>
            No results found for <strong>{address}</strong>. Please make sure that address is
            spelled correctly.
          </ValidationMessage>
        )}
      </div>
    </div>
  );
}
