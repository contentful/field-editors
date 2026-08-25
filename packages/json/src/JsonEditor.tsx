import * as React from 'react';

import { FieldAPI, FieldConnector } from '@contentful/field-editor-shared';
import throttle from 'lodash/throttle';

import { JsonEditorField } from './JsonEditorField';
import { JsonEditorToolbar } from './JsonEditorToolbar';
import { JsonInvalidStatus } from './JsonInvalidStatus';
import { JSONObject } from './types';
import { stringifyJSON, parseJSON, SPACE_INDENT_COUNT } from './utils';

export interface JsonEditorProps {
  /**
   * is the field disabled initially
   */
  isInitiallyDisabled: boolean;

  /**
   * sdk.field
   */
  field: FieldAPI;
}

type NullableJsonObject = JSONObject | null | undefined;

type ConnectedJsonEditorProps = {
  initialValue: NullableJsonObject;
  setValue: (value: NullableJsonObject) => void;
  disabled: boolean;
};

type ConnectedJsonEditorState = {
  value: string;
  isValidJson: boolean;
  undoStack: string[];
  redoStack: string[];
  lastUndo: string;
};

function ConnectedJsonEditor({ initialValue, setValue, disabled }: ConnectedJsonEditorProps) {
  const [state, setState] = React.useState<ConnectedJsonEditorState>(() => {
    return {
      value: stringifyJSON(initialValue),
      isValidJson: true,
      undoStack: [],
      redoStack: [],
      lastUndo: ''
    };
  });
  const stateRef = React.useRef(state);
  stateRef.current = state;
  const setValueRef = React.useRef(setValue);
  setValueRef.current = setValue;
  const valuesToPersistAfterCommitRef = React.useRef<NullableJsonObject[]>([]);

  React.useLayoutEffect(() => {
    const values = valuesToPersistAfterCommitRef.current.splice(0);
    values.forEach((value) => setValueRef.current(value));
  });

  const pushUndo = React.useMemo(
    () =>
      throttle((value: string) => {
        setState((currentState) => ({
          ...currentState,
          undoStack: [...currentState.undoStack, value]
        }));
      }, 400),
    []
  );

  const onChange = React.useCallback(
    (value: string) => {
      const currentState = stateRef.current;
      const parsed = parseJSON(value);

      if (value !== currentState.lastUndo) {
        pushUndo(currentState.value);
      }

      setState((latestState) => ({
        ...latestState,
        value,
        isValidJson: parsed.valid
      }));

      if (parsed.valid) {
        setValueRef.current(parsed.value);
      }
    },
    [pushUndo]
  );

  const onUndo = React.useCallback(() => {
    const undoStack = stateRef.current.undoStack;

    if (undoStack.length === 0) {
      return;
    }

    const value = undoStack.pop() || '';

    const parsedValue = parseJSON(value);

    if (parsedValue.valid) {
      valuesToPersistAfterCommitRef.current.push(parsedValue.value);
    }
    setState((currentState) => ({
      ...currentState,
      value,
      isValidJson: parsedValue.valid,
      undoStack,
      redoStack: [...currentState.redoStack, currentState.value],
      lastUndo: value
    }));
  }, []);

  const onRedo = React.useCallback(() => {
    const redoStack = [...stateRef.current.redoStack];

    if (redoStack.length === 0) {
      return;
    }

    const value = redoStack.pop() || '';

    const parsedValue = parseJSON(value);

    if (parsedValue.valid) {
      valuesToPersistAfterCommitRef.current.push(parsedValue.value);
    }
    setState((currentState) => ({
      ...currentState,
      value,
      isValidJson: parsedValue.valid,
      redoStack,
      undoStack: [...currentState.undoStack, currentState.value]
    }));
  }, []);

  return (
    <div data-test-id="json-editor">
      <JsonEditorToolbar
        isRedoDisabled={disabled || state.redoStack.length === 0}
        isUndoDisabled={disabled || state.undoStack.length === 0}
        onUndo={onUndo}
        onRedo={onRedo}
      />
      <JsonEditorField value={state.value} onChange={onChange} isDisabled={disabled} />
      {!state.isValidJson && <JsonInvalidStatus />}
    </div>
  );
}

export default function JsonEditor(props: JsonEditorProps) {
  return (
    <FieldConnector<JSONObject> field={props.field} isInitiallyDisabled={props.isInitiallyDisabled}>
      {({ value, disabled, setValue, externalReset }) => (
        <ConnectedJsonEditor
          // on external change reset component completely and init with initial value again
          key={`json-editor-${externalReset}`}
          initialValue={value}
          disabled={disabled}
          setValue={setValue}
        />
      )}
    </FieldConnector>
  );
}

JsonEditor.tabWidth = SPACE_INDENT_COUNT;
