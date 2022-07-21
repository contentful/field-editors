import * as React from 'react';

import { FieldAPI, FieldConnector } from '@contentful/field-editor-shared';
import deepEqual from 'deep-equal';
import throttle from 'lodash/throttle';

import { JsonEditorField } from './JsonEditorField';
import { JsonEditorToolbar } from './JsonEditorToobar';
import { JsonInvalidStatus } from './JsonInvalidStatus';
import { JSONObject } from './types';
import { stringifyJSON, parseJSON } from './utils';

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

class ConnectedJsonEditor extends React.Component<
  ConnectedJsonEditorProps,
  ConnectedJsonEditorState
> {
  static defaultProps = {
    isInitiallyDisabled: true,
  };

  constructor(props: ConnectedJsonEditorProps) {
    super(props);
    this.state = {
      value: stringifyJSON(props.initialValue),
      isValidJson: true,
      undoStack: [],
      redoStack: [],
      lastUndo: '',
    };
  }

  setValidJson = (value: boolean) => {
    this.setState({
      isValidJson: value,
    });
  };

  pushUndo = throttle((value: string) => {
    this.setState((state) => ({
      undoStack: [...state.undoStack, value],
    }));
  }, 400);

  onChange = (value: string) => {
    const parsed = parseJSON(value);

    if (value !== this.state.lastUndo) {
      this.pushUndo(this.state.value);
    }

    this.setState({
      value,
      isValidJson: parsed.valid,
    });

    if (parsed.valid) {
      this.props.setValue(parsed.value);
    }
  };

  onUndo = () => {
    const undoStack = this.state.undoStack;

    if (undoStack.length === 0) {
      return;
    }

    const value = undoStack.pop() || '';

    const parsedValue = parseJSON(value);

    this.setState(
      (state) => ({
        ...state,
        value,
        isValidJson: parsedValue.valid,
        undoStack,
        redoStack: [...state.redoStack, state.value],
        lastUndo: value,
      }),
      () => {
        if (parsedValue.valid) {
          this.props.setValue(parsedValue.value);
        }
      }
    );
  };

  onRedo = () => {
    const redoStack = [...this.state.redoStack];

    if (redoStack.length === 0) {
      return;
    }

    const value = redoStack.pop() || '';

    const parsedValue = parseJSON(value);

    this.setState(
      (state) => ({
        ...state,
        value,
        isValidJson: parsedValue.valid,
        redoStack,
        undoStack: [...state.undoStack, state.value],
      }),
      () => {
        if (parsedValue.valid) {
          this.props.setValue(parsedValue.value);
        }
      }
    );
  };

  render() {
    return (
      <div data-test-id="json-editor">
        <JsonEditorToolbar
          isRedoDisabled={this.props.disabled || this.state.redoStack.length === 0}
          isUndoDisabled={this.props.disabled || this.state.undoStack.length === 0}
          onUndo={this.onUndo}
          onRedo={this.onRedo}
        />
        <JsonEditorField
          value={this.state.value}
          onChange={this.onChange}
          isDisabled={this.props.disabled}
        />
        {!this.state.isValidJson && <JsonInvalidStatus />}
      </div>
    );
  }
}

export default function JsonEditor(props: JsonEditorProps) {
  return (
    <FieldConnector<JSONObject>
      field={props.field}
      isInitiallyDisabled={props.isInitiallyDisabled}
      isEqualValues={(value1, value2) => {
        return deepEqual(value1, value2);
      }}>
      {({ value, disabled, setValue, externalReset }) => {
        return (
          <ConnectedJsonEditor
            // on external change reset component completely and init with initial value again
            key={`json-editor-${externalReset}`}
            initialValue={value}
            disabled={disabled}
            setValue={setValue}
          />
        );
      }}
    </FieldConnector>
  );
}
