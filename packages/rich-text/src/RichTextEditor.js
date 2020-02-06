import * as tslib_1 from 'tslib';
import React from 'react';
import PropTypes from 'prop-types';
import { Editor } from 'slate-react';
import { Value, Editor as BasicEditor } from 'slate';
import { noop, debounce } from 'lodash-es';
import { List, is } from 'immutable';
import cn from 'classnames';
import deepEquals from 'fast-deep-equal';
import { BLOCKS, EMPTY_DOCUMENT } from '@contentful/rich-text-types';
import { toContentfulDocument, toSlatejsDocument } from '@contentful/contentful-slatejs-adapter';
import schema from './constants/Schema';
import { createRichTextAPI } from './plugins/shared/PluginApi';
import { buildPlugins } from './plugins';
import Toolbar from './Toolbar';
import StickyToolbarWrapper from './Toolbar/StickyToolbarWrapper';
import { FieldConnector } from '@contentful/field-editor-shared';
var createSlateValue = function(contentfulDocument) {
  var document = toSlatejsDocument({
    document: contentfulDocument,
    schema: schema
  });
  var value = Value.fromJSON({
    document: document,
    schema: schema
  });
  // Normalize document instead of doing this in the Editor instance as this would
  // trigger unwanted operations that would result in an unwanted version bump.
  // TODO: This normalization step wouldn't be necessary if we had a perfect
  // adapter for the version of Slate we are currently using.
  var editor = new BasicEditor({ readOnly: true, value: value }, { normalize: true });
  var normalizedValue = editor.value;
  return normalizedValue;
};
var EMPTY_SLATE_DOCUMENT = createSlateValue(EMPTY_DOCUMENT);
var ConnectedRichTextEditor = /** @class */ (function(_super) {
  tslib_1.__extends(ConnectedRichTextEditor, _super);
  function ConnectedRichTextEditor() {
    var _this = (_super !== null && _super.apply(this, arguments)) || this;
    _this.state = {
      lastOperations: List(),
      isEmbedDropdownOpen: false,
      value:
        _this.props.value && _this.props.value.nodeType === BLOCKS.DOCUMENT
          ? createSlateValue(_this.props.value)
          : EMPTY_SLATE_DOCUMENT
    };
    _this.editor = React.createRef();
    _this.slatePlugins = buildPlugins(
      createRichTextAPI({
        widgetAPI: _this.props.widgetAPI,
        onAction: _this.props.onAction
      })
    );
    _this.onChange = function(editor) {
      var value = editor.value,
        operations = editor.operations;
      _this.setState({
        value: value,
        lastOperations: operations.filter(isRelevantOperation)
      });
    };
    _this.callOnChange = debounce(function() {
      var doc = toContentfulDocument({
        document: _this.state.value.document.toJSON(),
        schema: schema
      });
      _this.props.onChange(doc);
    }, 500);
    // eslint-disable-next-line no-unused-vars
    _this.handleKeyDown = function(event, editor, next) {
      var ESC = 27;
      if (event.keyCode === ESC) {
        event.currentTarget.blur();
      }
      return next();
    };
    return _this;
  }
  ConnectedRichTextEditor.prototype.shouldComponentUpdate = function(nextProps, nextState) {
    if (this.props.isDisabled !== nextProps.isDisabled) {
      return true;
    }
    var isStateValueUpdate = !is(this.state.value, nextState.value);
    var isPropsValueUpdate = this.props.value !== nextProps.value;
    return isStateValueUpdate || isPropsValueUpdate;
  };
  ConnectedRichTextEditor.prototype.componentDidUpdate = function(prevProps) {
    var _this = this;
    var isIncomingChange = function() {
      return !deepEquals(prevProps.value, _this.props.value);
    };
    var isDocumentChanged = !this.state.lastOperations.isEmpty();
    if (!this.props.isDisabled && isDocumentChanged) {
      this.setState({ lastOperations: List() }, function() {
        return _this.callOnChange();
      });
    } else if (isIncomingChange()) {
      this.setState({
        value: createSlateValue(this.props.value)
      });
    }
  };
  ConnectedRichTextEditor.prototype.render = function() {
    var classNames = cn('rich-text', {
      'rich-text--enabled': !this.props.isDisabled,
      'rich-text--hidden-toolbar': this.props.isToolbarHidden
    });
    return React.createElement(
      'div',
      { className: classNames },
      !this.props.isToolbarHidden &&
        React.createElement(
          StickyToolbarWrapper,
          { isDisabled: this.props.isDisabled },
          React.createElement(Toolbar, {
            editor: this.editor.current || new BasicEditor({ readOnly: true }),
            onChange: this.onChange,
            isDisabled: this.props.isDisabled,
            permissions: this.props.widgetAPI.permissions,
            richTextAPI: createRichTextAPI({
              widgetAPI: this.props.widgetAPI,
              onAction: this.props.onAction
            })
          })
        ),
      React.createElement(Editor, {
        'data-test-id': 'editor',
        value: this.state.value,
        ref: this.editor,
        onChange: this.onChange,
        onKeyDown: this.handleKeyDown,
        plugins: this.slatePlugins,
        readOnly: this.props.isDisabled,
        className: 'rich-text__editor',
        actionsDisabled: this.props.actionsDisabled,
        options: {
          normalize: false // No initial normalizaiton as we pass a normalized document.
        }
      })
    );
  };
  ConnectedRichTextEditor.propTypes = {
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
    scope: PropTypes.object
  };
  ConnectedRichTextEditor.defaultProps = {
    value: EMPTY_DOCUMENT,
    onChange: noop,
    onAction: noop,
    isDisabled: false,
    isToolbarHidden: false,
    actionsDisabled: false
  };
  return ConnectedRichTextEditor;
})(React.Component);
export { ConnectedRichTextEditor };
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
  return React.createElement(
    FieldConnector,
    {
      throttle: 0,
      field: props.widgetAPI.field,
      isInitiallyDisabled: props.isInitiallyDisabled,
      isEmptyValue: function(value) {
        return !value || deepEquals(value, EMPTY_DOCUMENT);
      },
      isEqualValues: function(value1, value2) {
        return deepEquals(value1, value2);
      }
    },
    function(_a) {
      var lastRemoteValue = _a.lastRemoteValue,
        disabled = _a.disabled,
        setValue = _a.setValue,
        externalReset = _a.externalReset;
      return React.createElement(
        ConnectedRichTextEditor,
        // on external change reset component completely and init with initial value again
        {
          // on external change reset component completely and init with initial value again
          key: 'rich-text-editor-' + externalReset,
          value: lastRemoteValue,
          widgetAPI: props.widgetAPI,
          isDisabled: disabled,
          onChange: function(value) {
            setValue(value);
          }
        }
      );
    }
  );
}
//# sourceMappingURL=RichTextEditor.js.map
