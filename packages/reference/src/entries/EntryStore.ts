import * as React from 'react';
import { BaseExtensionSDK, Entry, Action } from '../types';
import constate from 'constate';

type EntriesMap = {
  [key: string]: 'failed' | undefined | Entry;
};

type State = {
  entries: EntriesMap;
};

type DispatchAction =
  | { type: 'set_entry'; id: string; entry: Entry }
  | { type: 'set_failed_entry'; id: string };

function reducer(state: State, action: DispatchAction) {
  switch (action.type) {
    case 'set_entry':
      return {
        ...state,
        entries: {
          ...state.entries,
          [action.id]: action.entry
        } as EntriesMap
      };
    case 'set_failed_entry':
      return {
        ...state,
        entries: {
          ...state.entries,
          [action.id]: 'failed'
        } as EntriesMap
      };
    default:
      return state;
  }
}

const initialState: State = {
  entries: {}
};

function useEntriesStore(props: { sdk: BaseExtensionSDK; onAction?: (action: Action) => void }) {
  const [state, dispatch] = React.useReducer(reducer, initialState);

  const loadEntry = (id: string) => {
    props.sdk.space
      .getEntry<Entry>(id)
      .then(entry => {
        dispatch({ type: 'set_entry', id, entry });
      })
      .catch(() => {
        dispatch({ type: 'set_failed_entry', id });
      });
  };

  React.useEffect(() => {
    const unsubscribe = props.sdk.navigator.onSlideInNavigation(
      ({ oldSlideLevel, newSlideLevel }) => {
        if (oldSlideLevel > newSlideLevel) {
          Object.keys(state.entries).map(id => {
            loadEntry(id);
          });
        }
      }
    );
    return () => {
      unsubscribe();
    };
  }, [props.sdk, state.entries]);

  return { loadEntry, entries: state.entries };
}

const [EntriesProvider, useEntries] = constate(useEntriesStore);

export { EntriesProvider, useEntries };
