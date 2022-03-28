import React from 'react';
import { css } from 'emotion';
import tokens from '@contentful/f36-tokens';
import { Button, Card } from '@contentful/f36-components';
import { Coords, GeocodeApiResponse } from './types';

import { Spinner, ValidationMessage, TextInput } from '@contentful/f36-components';

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
  suggestion: css({
    position: 'absolute',
    transform: 'translateY(100%)',
    bottom: 0,
    left: 0,
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
          isInvalid={hasError}
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
          isDisabled={props.disabled}
        />
        {isSearching && <Spinner className={styles.spinner} />}
        {suggestion && (
          <Card
            padding="none"
            className={styles.suggestion}
            // specific attribute to mark that this element is absolute positioned
            // for internal contentful apps usage
            data-position-absolute>
            <Button
              variant="transparent"
              testId="location-editor-suggestion"
              onClick={() => {
                setAddress(suggestion.address);
                props.onChangeLocation(suggestion.location);
                setSuggestion(null);
              }}>
              {suggestion.address}
            </Button>
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
