import React from 'react';
import type { Emitter } from 'mitt';
import { css } from 'emotion';
import tokens from '@contentful/forma-36-tokens';

type EventDefinition = { type?: string; value: any; id: number };

type ActionsPlaygroundProps = {
  mitt: Emitter;
  renderValue: Function;
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
          value: action.payload.value,
        },
        ...state.events,
      ],
    };
  }
  return state;
}

function ActionsPlayground(props: ActionsPlaygroundProps) {
  const [state, dispatch] = React.useReducer(reducer, { events: [] });

  const onLog = (type?: string, event?: any) => {
    dispatch({
      type: 'add',
      payload: {
        type,
        value: event,
      },
    });
  };

  React.useEffect(() => {
    props.mitt.on('*', onLog);

    if ((window as any).Cypress) {
      (window as any).editorEvents = [];
      (window as any).setValueExternal = (value: any) => {
        props.mitt.emit('onValueChanged', value);
      };
    }

    return () => {
      props.mitt.off('*', onLog);
      (window as any).editorEvents = undefined;
      (window as any).setValueExternal = undefined;
    };
  }, [props.mitt]);

  React.useEffect(() => {
    (window as any).editorEvents = [...state.events];
  }, [props, state.events]);

  return (
    <div
      className={css({
        border: `1px solid ${tokens.gray200}`,
        padding: tokens.spacingS,
        marginTop: tokens.spacingXl,
      })}>
      <div
        className={css({
          height: 150,
          overflowY: 'scroll',
          fontSize: tokens.fontSizeM,
        })}>
        {state.events.map((log) => (
          <div key={log.id}>
            <div>
              <code>
                {log.id}. {log.type}
              </code>
            </div>
            <div>{log.value ? props.renderValue(log.value, log.type) : <pre>undefined</pre>}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

ActionsPlayground.defaultProps = {
  renderValue: function JsonStringifiedValue(value: any) {
    return <pre>{JSON.stringify(value, null, 2)}</pre>;
  },
};

export { ActionsPlayground };
