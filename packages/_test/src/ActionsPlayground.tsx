import React from 'react';
import { Emitter } from 'mitt';
import { css } from 'emotion';
import tokens from '@contentful/forma-36-tokens';

type EventDefinition = { type?: string; value: any; id: number };

type ActionsPlaygroundProps = {
  mitt: Emitter;
  onCollect?: (events: EventDefinition[]) => void;
};

type ActionPlaygroundState = {
  events: EventDefinition[];
};

type AddActions = { type: 'add'; payload: { type?: string; value: any } };
type Actions = AddActions;

function reducer(state: ActionPlaygroundState, action: Actions): ActionPlaygroundState {
  if (action.type === 'add') {
    return {
      ...state,
      events: [
        {
          id: state.events.length + 1,
          type: action.payload.type,
          value: action.payload.value
        },
        ...state.events
      ]
    };
  }
  return state;
}

export function ActionsPlayground(props: ActionsPlaygroundProps) {
  const [state, dispatch] = React.useReducer(reducer, { events: [] });

  const onLog = (type?: string, event?: any) => {
    dispatch({
      type: 'add',
      payload: {
        type,
        value: event
      }
    });
  };

  React.useEffect(() => {
    props.mitt.on('*', onLog);
    return () => {
      props.mitt.off('*', onLog);
    };
  }, [props.mitt]);

  React.useEffect(() => {
    if (props.onCollect) {
      props.onCollect(state.events);
    }
  }, [props, state.events]);

  return (
    <div
      className={css({
        border: `1px solid ${tokens.colorElementLight}`,
        padding: tokens.spacingS,
        marginTop: tokens.spacingXl
      })}>
      <div
        className={css({
          height: 150,
          overflowY: 'scroll',
          fontSize: tokens.fontSizeM
        })}>
        {state.events.map(log => (
          <div key={log.id}>
            <div>
              <code>
                {log.id}. {log.type}
              </code>
            </div>
            <div>
              <pre>{log.value ? JSON.stringify(log.value, null, 2) : 'undefined'}</pre>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
