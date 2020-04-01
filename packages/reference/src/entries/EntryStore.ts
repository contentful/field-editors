import * as React from 'react';
import { BaseExtensionSDK, Entry, Action } from '../types';
import constate from 'constate';

type EntriesMap = {
  [key: string]: 'failed' | undefined | Entry;
};

function useEntriesStore(props: { sdk: BaseExtensionSDK; onAction?: (action: Action) => void }) {
  const [entries, setEntries] = React.useState<EntriesMap>({});

  const loadEntry = (id: string) => {
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
  };

  const setEntry = (id: string, entry: Entry) => {
    setEntries({
      ...entries,
      [id]: entry
    });
  };

  return { loadEntry, setEntry, entries };
}

const [EntriesProvider, useEntries] = constate(useEntriesStore);

export { EntriesProvider, useEntries };
