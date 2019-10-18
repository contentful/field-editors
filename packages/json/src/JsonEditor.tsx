import * as React from 'react';
import { FieldAPI, FieldConnector } from '@contentful/field-editor-shared';
import { JsonEditorToolbar } from './JsonEditorToobar';
import { JsonInvalidStatus } from './JsonInvalidStatus';
import { JsonEditorField } from './JsonEditoField';
import { JSONObject } from './types';
import { stringifyJSON, parseJSON } from './utils';

export interface JsonEditorProps {
  /**
   * is the field disabled initially
   */
  isInitiallyDisabled: boolean;

  field: FieldAPI;
}

type NullableJsonObject = JSONObject | null | undefined;

type ConnectedJsonEditorProps = {
  value: string;
  setValue: (value: NullableJsonObject) => void;
  disabled: boolean;
};

type ConnectedJsonEditorState = {
  prevSavedValue: string;
  value: string;
  isValidJson: boolean;
  undoStack: string[];
  redoStack: string[];
};

class ConnectedJsonEditor extends React.Component<
  ConnectedJsonEditorProps,
  ConnectedJsonEditorState
> {
  static defaultProps = {
    isInitiallyDisabled: true
  };

  constructor(props: ConnectedJsonEditorProps) {
    super(props);
    this.state = {
      prevSavedValue: props.value,
      value: props.value,
      isValidJson: true,
      undoStack: [],
      redoStack: []
    };
  }

  static getDerivedStateFromProps(
    props: ConnectedJsonEditorProps,
    state: ConnectedJsonEditorState
  ) {
    if (state.value !== state.prevSavedValue) {
      return {
        prevSavedValue: props.value,
        value: props.value,
        isValidJson: true,
        undoStack: [],
        redoStack: []
      };
    }
    return null;
  }

  setValidJson = (value: boolean) => {
    this.setState({
      isValidJson: value
    });
  };

  onChange = (value: string) => {
    const parsed = parseJSON(value);
    this.pushUndo(value);
    if (parsed.valid) {
      this.setValidJson(true);
      this.props.setValue(parsed.value);
      this.setState({ prevSavedValue: value });
    } else {
      this.setValidJson(false);
    }
  };

  getLastUndo = () => {};

  getLastRedo = () => {};

  pushUndo = (value: string) => {
    this.setState(state => ({
      ...state,
      undoStack: [value, ...state.undoStack]
    }));
  };

  popUndo = (): string | null => {
    const undoStack = [...this.state.undoStack];
    if (undoStack.length === 0) {
      return null;
    }
    const value = undoStack.pop() || null;

    if (value) {
      this.setState(state => ({
        ...state,
        undoStack
      }));

      this.pushRedo(value);
    }

    return value;
  };

  pushRedo = (value: string) => {
    this.setState(state => ({
      ...state,
      redoStack: [value, ...state.redoStack]
    }));
  };

  onUndo = () => {};

  onRedo = () => {};

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
    <FieldConnector<JSONObject> field={props.field} isInitiallyDisabled={props.isInitiallyDisabled}>
      {({ value, disabled, setValue }) => {
        const valueAsString = stringifyJSON(value);
        return (
          <ConnectedJsonEditor value={valueAsString} disabled={disabled} setValue={setValue} />
        );
      }}
    </FieldConnector>
  );
}
