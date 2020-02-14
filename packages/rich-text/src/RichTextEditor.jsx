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

import schema from './constants/Schema';
import { createRichTextAPI } from './plugins/shared/PluginApi';
import { buildPlugins } from './plugins';
import Toolbar from './Toolbar';
import StickyToolbarWrapper from './Toolbar/StickyToolbarWrapper';
import { FieldConnector } from '@contentful/field-editor-shared';
import { css, cx } from 'emotion';
import tokens from '@contentful/forma-36-tokens';

const STYLE_EDITOR_BORDER = '1px solid #c3cfd5';

const styles = {
  root: css({
    position: 'relative'
  }),
  enabled: css({
    background: tokens.colorWhite,
    a: {
      span: {
        cursor: 'pointer',
        '&:hover': {
          cursor: 'pointer'
        }
      }
    }
  }),
  hiddenToolbar: css({
    border: STYLE_EDITOR_BORDER
  }),
  editor: css({
    borderRadius: '0 0 3px 3px',
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
          cursor: 'not-allowed'
        }
      }
    },
    button: {
      border: STYLE_EDITOR_BORDER,
      background: tokens.colorElementLight,
      padding: '0 8px',
      '&:hover': {
        borderColor: tokens.colorElementDarkest
      },
      '.active': {
        borderColor: tokens.colorElementDarkest,
        background: tokens.colorElementMid,
        webkitBoxShadow: 'inset 0 1px 2px rgba(0,0,0,0.12)',
        boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.12)'
      }
    }
  })
};

const createSlateValue = contentfulDocument => {
  const document = toSlatejsDocument({
    document: contentfulDocument,
    schema
  });
  const value = Value.fromJSON({
    document,
    schema
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
    widgetAPI: PropTypes.shape({
      field: PropTypes.shape({
        id: PropTypes.string.isRequired,
        locale: PropTypes.string.isRequired
      }).isRequired,
      permissions: PropTypes.shape({
        canAccessAssets: PropTypes.bool.isRequired,
        canCreateAsset: PropTypes.bool.isRequired,
        canCreateEntryOfContentType: PropTypes.object.isRequired
      }).isRequired
    }).isRequired,
    value: PropTypes.object.isRequired,
    isDisabled: PropTypes.bool,
    onChange: PropTypes.func,
    onAction: PropTypes.func,
    isToolbarHidden: PropTypes.bool,
    actionsDisabled: PropTypes.bool,
    customRenderers: PropTypes.shape({
      renderEntityBlockEmbed: PropTypes.func,
      renderEntryInlineEmbed: PropTypes.func,
      renderEntityHyperlinkTooltip: PropTypes.func
    })
  };

  static defaultProps = {
    value: EMPTY_DOCUMENT,
    onChange: noop,
    onAction: noop,
    isDisabled: false,
    isToolbarHidden: false,
    actionsDisabled: false,
    customRenderers: {}
  };

  state = {
    lastOperations: List(),
    isEmbedDropdownOpen: false,
    value:
      this.props.value && this.props.value.nodeType === BLOCKS.DOCUMENT
        ? createSlateValue(this.props.value)
        : EMPTY_SLATE_DOCUMENT
  };

  editor = React.createRef();

  richTextAPI = createRichTextAPI({
    widgetAPI: this.props.widgetAPI,
    onAction: this.props.onAction,
    customRenderers: this.props.customRenderers
  });

  slatePlugins = buildPlugins(this.richTextAPI);

  onChange = editor => {
    const { value, operations } = editor;
    this.setState({
      value,
      lastOperations: operations.filter(isRelevantOperation)
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
      schema
    });
    this.props.onChange(doc);
  }, 500);

  componentDidUpdate(prevProps) {
    const isIncomingChange = () => !deepEquals(prevProps.value, this.props.value);
    const isDocumentChanged = !this.state.lastOperations.isEmpty();

    if (!this.props.isDisabled && isDocumentChanged) {
      this.setState({ lastOperations: List() }, () => this.callOnChange());
    } else if (isIncomingChange()) {
      this.setState({
        value: createSlateValue(this.props.value)
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
      styles.root,
      !this.props.isDisabled && styles.enabled,
      this.props.isToolbarHidden && styles.toolbarHidden
    );

    return (
      <div className={classNames}>
        {!this.props.isToolbarHidden && (
          <StickyToolbarWrapper isDisabled={this.props.isDisabled}>
            <Toolbar
              editor={this.editor.current || new BasicEditor({ readOnly: true })}
              onChange={this.onChange}
              isDisabled={this.props.isDisabled}
              permissions={this.props.widgetAPI.permissions}
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
          className={styles.editor}
          actionsDisabled={this.props.actionsDisabled}
          options={{
            normalize: false // No initial normalizaiton as we pass a normalized document.
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
  const { widgetAPI, isInitiallyDisabled, ...otherProps } = props;
  return (
    <FieldConnector
      throttle={0}
      field={widgetAPI.field}
      isInitiallyDisabled={isInitiallyDisabled}
      isEmptyValue={value => {
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
            widgetAPI={widgetAPI}
            isDisabled={disabled}
            onChange={value => {
              setValue(value);
            }}
          />
        );
      }}
    </FieldConnector>
  );
}
