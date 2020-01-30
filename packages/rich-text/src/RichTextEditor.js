import React from 'react';
import PropTypes from 'prop-types';
import { Editor } from 'slate-react';
import { Value, Editor as BasicEditor } from 'slate';
import { noop } from 'lodash';
import debounce from 'lodash/debounce';
import { List, is } from 'immutable';
import cn from 'classnames';

import deepEqual from 'fast-deep-equal';
import StickyToolbarWrapper from './Toolbar/StickyToolbarWrapper';

import { toContentfulDocument, toSlatejsDocument } from '@contentful/contentful-slatejs-adapter';

import { createRichTextAPI } from './plugins/shared/PluginApi';
import { buildPlugins } from './plugins';

import schema from './constants/Schema';
import { BLOCKS, EMPTY_DOCUMENT } from '@contentful/rich-text-types';

import Toolbar from './Toolbar';

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
  // trigger unwanted operations that would result in an unwated version bump.
  // TODO: This normalization step wouldn't be necessary if we had a perfect
  // adapter for the version of Slate we are currently using.
  const editor = new BasicEditor({ readOnly: true, value }, { normalize: true });
  const normalizedValue = editor.value;
  return normalizedValue;
};

const emptySlateValue = createSlateValue(EMPTY_DOCUMENT);

export default class RichTextEditor extends React.Component {
  static propTypes = {
    widgetAPI: PropTypes.shape({
      field: PropTypes.shape({
        id: PropTypes.string.isRequired,
        locale: PropTypes.string.isRequired
      }).isRequired,
      permissions: PropTypes.shape({
        canAccessAssets: PropTypes.bool.isRequired
      }).isRequired
    }).isRequired,
    value: PropTypes.object.isRequired,
    isDisabled: PropTypes.bool,
    onChange: PropTypes.func,
    onAction: PropTypes.func,
    isToolbarHidden: PropTypes.bool,
    actionsDisabled: PropTypes.bool,
    scope: PropTypes.object
  };

  static defaultProps = {
    value: EMPTY_DOCUMENT,
    onChange: noop,
    onAction: noop,
    isToolbarHidden: false,
    actionsDisabled: false
  };

  state = {
    lastOperations: List(),
    isEmbedDropdownOpen: false,
    value:
      this.props.value && this.props.value.nodeType === BLOCKS.DOCUMENT
        ? createSlateValue(this.props.value)
        : emptySlateValue
  };

  editor = React.createRef();

  slatePlugins = buildPlugins(
    createRichTextAPI({
      widgetAPI: this.props.widgetAPI,
      onAction: this.props.onAction
    })
  );

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
    const isIncomingChange = () => !deepEqual(prevProps.value, this.props.value);
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
    const classNames = cn('rich-text', {
      'rich-text--enabled': !this.props.isDisabled,
      'rich-text--hidden-toolbar': this.props.isToolbarHidden
    });

    return (
      <div className={classNames}>
        {!this.props.isToolbarHidden && (
          <StickyToolbarWrapper isDisabled={this.props.isDisabled}>
            <Toolbar
              editor={this.editor.current || new BasicEditor({ readOnly: true })}
              onChange={this.onChange}
              isDisabled={this.props.isDisabled}
              permissions={this.props.widgetAPI.permissions}
              richTextAPI={createRichTextAPI({
                widgetAPI: this.props.widgetAPI,
                onAction: this.props.onAction
              })}
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
          className="rich-text__editor"
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
