import * as React from 'react';
import { BaseExtensionSDK, Entry } from '../types';
import constate from 'constate';

type EntriesMap = {
  [key: string]: 'failed' | undefined | Entry;
};

function useCounter(props: { sdk: BaseExtensionSDK }) {
  const [entries, setEntries] = React.useState<EntriesMap>({});

  const loadEntry = React.useCallback((id: string) => {
    props.sdk.space
      .getEntry<Entry>(id)
      .then(entry => {
        setEntries({
          ...entries,
          [id]: entry
        });
      })
      .catch(() => {
        setEntries({
          ...entries,
          [id]: 'failed'
        });
      });
  }, []);

  const setEntry = React.useCallback((id: string, entry: Entry) => {
    setEntries({
      ...entries,
      [id]: entry
    });
  }, []);

  return { loadEntry, setEntry, entries };
}

const [EntityProvider, useEntityStore] = constate(useCounter);

export { EntityProvider, useEntityStore };
