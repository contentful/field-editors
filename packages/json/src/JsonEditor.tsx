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
      lastUndo: '',
    };
  });

  const pushUndo = React.useMemo(
    () =>
      throttle((value: string) => {
        setState((currentState) => ({
          ...currentState,
          undoStack: [...currentState.undoStack, value],
        }));
      }, 400),
    [],
  );

  React.useEffect(() => () => pushUndo.cancel(), [pushUndo]);

  const onChange = (value: string) => {
    const parsed = parseJSON(value);

    if (value !== state.lastUndo) {
      pushUndo(state.value);
    }

    setState((currentState) => ({
      ...currentState,
      value,
      isValidJson: parsed.valid,
    }));

    if (parsed.valid) {
      setValue(parsed.value);
    }
  };

  const onUndo = () => {
    const undoStack = [...state.undoStack];

    if (undoStack.length === 0) {
      return;
    }

    const value = undoStack.pop() || '';

    const parsedValue = parseJSON(value);

    setState((currentState) => ({
      ...currentState,
      value,
      isValidJson: parsedValue.valid,
      undoStack,
      redoStack: [...currentState.redoStack, currentState.value],
      lastUndo: value,
    }));
    if (parsedValue.valid) {
      setValue(parsedValue.value);
    }
  };

  const onRedo = () => {
    const redoStack = [...state.redoStack];

    if (redoStack.length === 0) {
      return;
    }

    const value = redoStack.pop() || '';

    const parsedValue = parseJSON(value);

    setState((currentState) => ({
      ...currentState,
      value,
      isValidJson: parsedValue.valid,
      redoStack,
      undoStack: [...currentState.undoStack, currentState.value],
    }));
    if (parsedValue.valid) {
      setValue(parsedValue.value);
    }
  };

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
