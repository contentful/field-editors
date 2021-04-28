import React from 'react';
import PropTypes from 'prop-types';
import { Editor } from 'slate-react';
import { Value, Editor as BasicEditor } from 'slate';
import noop from 'lodash/noop';
import debounce from 'lodash/debounce';
import { List, is } from 'immutable';
import deepEquals from 'fast-deep-equal';

import { BLOCKS, EMPTY_DOCUMENT } from '@contentful/rich-text-types';
import { toContentfulDocument, toSlatejsDocument } from '@contentful/contentful-slatejs-adapter';
import { EntityProvider } from '@contentful/field-editor-reference';

import schema from './constants/Schema';
import { createRichTextAPI } from './plugins/shared/PluginApi';
import { buildPlugins } from './plugins';
import Toolbar from './Toolbar';
import StickyToolbarWrapper from './Toolbar/StickyToolbarWrapper';
import { FieldConnector } from '@contentful/field-editor-shared';
import { css, cx } from 'emotion';
import tokens from '@contentful/forma-36-tokens';

const STYLE_EDITOR_BORDER = `1px solid ${tokens.colorElementDark}`;

const styles = {
  root: css({
    position: 'relative',
  }),
  editor: css({
    borderRadius: `0 0 ${tokens.borderRadiusMedium} ${tokens.borderRadiusMedium}`,
    border: STYLE_EDITOR_BORDER,
    borderTop: 0,
    padding: '20px',
    fontSize: tokens.spacingM,
    minHeight: '400px',
    background: tokens.colorWhite,
    outline: 'none',
    whiteSpace: 'pre-wrap',
    overflowWrap: 'break-word',
    webkitUserModify: 'read-write-plaintext-only',
    a: {
      span: {
        cursor: 'not-allowed',
        '&:hover': {
          cursor: 'not-allowed',
        },
      },
    },
  }),
  hiddenToolbar: css({
    borderTop: STYLE_EDITOR_BORDER,
  }),
  enabled: css({
    background: tokens.colorWhite,
    a: {
      span: {
        cursor: 'pointer',
        '&:hover': {
          cursor: 'pointer',
        },
      },
    },
  }),
  disabled: css({
    background: tokens.colorElementLightest,
  }),
};

const createSlateValue = (contentfulDocument) => {
  const document = toSlatejsDocument({
    document: contentfulDocument,
    schema,
  });
  const value = Value.fromJSON({
    document,
    schema,
  });
  // Normalize document instead of doing this in the Editor instance as this would
  // trigger unwanted operations that would result in an unwanted version bump.
  // TODO: This normalization step wouldn't be necessary if we had a perfect
  // adapter for the version of Slate we are currently using.
  const editor = new BasicEditor({ readOnly: true, value }, { normalize: true });
  const normalizedValue = editor.value;
  return normalizedValue;
};

const EMPTY_SLATE_DOCUMENT = createSlateValue(EMPTY_DOCUMENT);

export class ConnectedRichTextEditor extends React.Component {
  static propTypes = {
    minHeight: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    sdk: PropTypes.shape({
      field: PropTypes.shape({
        id: PropTypes.string.isRequired,
        locale: PropTypes.string.isRequired,
      }).isRequired,
      access: PropTypes.shape({
        can: PropTypes.func.isRequired,
      }).isRequired,
      parameters: PropTypes.shape({
        instance: PropTypes.shape({
          getEntryUrl: PropTypes.func,
          getAssetUrl: PropTypes.func,
        }).isRequired,
      }),
    }).isRequired,
    value: PropTypes.object,
    isDisabled: PropTypes.bool,
    onChange: PropTypes.func,
    onAction: PropTypes.func,
    isToolbarHidden: PropTypes.bool,
    actionsDisabled: PropTypes.bool,
  };

  static defaultProps = {
    value: EMPTY_DOCUMENT,
    onChange: noop,
    onAction: noop,
    isDisabled: false,
    isToolbarHidden: false,
    actionsDisabled: false,
  };

  state = {
    lastOperations: List(),
    value:
      this.props.value && this.props.value.nodeType === BLOCKS.DOCUMENT
        ? createSlateValue(this.props.value)
        : EMPTY_SLATE_DOCUMENT,
  };

  editor = React.createRef();

  richTextAPI = createRichTextAPI({
    sdk: this.props.sdk,
    onAction: this.props.onAction,
  });

  slatePlugins = buildPlugins(this.richTextAPI, this.props.customPlugins);

  onChange = (editor) => {
    const { value, operations } = editor;
    this.setState({
      value,
      lastOperations: operations.filter(isRelevantOperation),
    });
  };

  shouldComponentUpdate(nextProps, nextState) {
    if (this.props.isDisabled !== nextProps.isDisabled) {
      return true;
    }
    const isStateValueUpdate = !is(this.state.value, nextState.value);
    const isPropsValueUpdate = this.props.value !== nextProps.value;
    return isStateValueUpdate || isPropsValueUpdate;
  }

  callOnChange = debounce(() => {
    const doc = toContentfulDocument({
      document: this.state.value.document.toJSON(),
      schema,
    });
    this.props.onChange(doc);
  }, 500);

  componentDidUpdate(prevProps) {
    /* eslint-disable react/no-did-update-set-state */
    const isIncomingChange = () => !deepEquals(prevProps.value, this.props.value);
    const isDocumentChanged = !this.state.lastOperations.isEmpty();

    if (!this.props.isDisabled && isDocumentChanged) {
      this.setState({ lastOperations: List() }, () => this.callOnChange());
    } else if (isIncomingChange()) {
      this.setState({
        value: createSlateValue(this.props.value),
      });
    }
  }

  // eslint-disable-next-line no-unused-vars
  handleKeyDown = (event, editor, next) => {
    const ESC = 27;

    if (event.keyCode === ESC) {
      event.currentTarget.blur();
    }

    return next();
  };

  render() {
    const classNames = cx(
      styles.editor,
      this.props.minHeight !== undefined ? css({ minHeight: this.props.minHeight }) : undefined,
      this.props.isDisabled ? styles.disabled : styles.enabled,
      this.props.isToolbarHidden && styles.hiddenToolbar
    );

    return (
      <div className={styles.root} data-test-id="rich-text-editor">
        {!this.props.isToolbarHidden && (
          <StickyToolbarWrapper isDisabled={this.props.isDisabled}>
            <Toolbar
              editor={this.editor.current || new BasicEditor({ readOnly: true })}
              onChange={this.onChange}
              isDisabled={this.props.isDisabled}
              richTextAPI={this.richTextAPI}
            />
          </StickyToolbarWrapper>
        )}

        <Editor
          data-test-id="editor"
          value={this.state.value}
          ref={this.editor}
          onChange={this.onChange}
          onKeyDown={this.handleKeyDown}
          plugins={this.slatePlugins}
          readOnly={this.props.isDisabled}
          className={classNames}
          actionsDisabled={this.props.actionsDisabled}
          options={{
            normalize: false, // No initial normalizaiton as we pass a normalized document.
          }}
        />
      </div>
    );
  }
}

/**
 * Returns whether a given operation is relevant enough to trigger a save.
 *
 * @param {slate.Operation} op
 * @returns {boolean}
 */
function isRelevantOperation(op) {
  if (op.type === 'set_value') {
    if (op.properties.data) {
      // Relevant for undo/redo that can be empty ops that we want to ignore.
      return false;
    }
  } else if (op.type === 'set_selection') {
    return false;
  }
  return true;
}

export default function RichTextEditor(props) {
  /* eslint-disable react/prop-types */
  const { sdk, isInitiallyDisabled, ...otherProps } = props;
  return (
    <EntityProvider sdk={sdk}>
      <FieldConnector
        throttle={0}
        field={sdk.field}
        isInitiallyDisabled={isInitiallyDisabled}
        isEmptyValue={(value) => {
          return !value || deepEquals(value, EMPTY_DOCUMENT);
        }}
        isEqualValues={(value1, value2) => {
          return deepEquals(value1, value2);
        }}>
        {({ lastRemoteValue, disabled, setValue, externalReset }) => {
          return (
            <ConnectedRichTextEditor
              {...otherProps}
              // on external change reset component completely and init with initial value again
              key={`rich-text-editor-${externalReset}`}
              value={lastRemoteValue}
              sdk={sdk}
              isDisabled={disabled}
              onChange={(value) => {
                setValue(value);
              }}
            />
          );
        }}
      </FieldConnector>
    </EntityProvider>
  );
}

RichTextEditor.defaultProps = {
  isInitiallyDisabled: true,
};
