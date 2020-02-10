import React from 'react';
import PropTypes from 'prop-types';
import { InlineEntryCard } from '@contentful/forma-36-react-components';
import { css } from 'emotion';
import { INLINES } from '@contentful/rich-text-types';

const styles = {
  root: css({
    margin: '0px 5px',
    'font-size': 'inherit',
    span: {
      '-webkit-user-select': 'none',
      '-moz-user-select': 'none',
      '-ms-user-select': 'none',
      'user-select': 'none'
    }
  })
};

class EmbeddedEntryInline extends React.Component {
  static propTypes = {
    widgetAPI: PropTypes.object.isRequired,
    isSelected: PropTypes.bool.isRequired,
    attributes: PropTypes.object.isRequired,
    editor: PropTypes.object.isRequired,
    node: PropTypes.object.isRequired,
    onEntityFetchComplete: PropTypes.func,
    renderEntity: PropTypes.func
  };

  static defaultProps = {
    renderEntity: ({ entryId, isSelected }) => (
      <InlineEntryCard testId={INLINES.EMBEDDED_ENTRY} selected={isSelected}>
        Entry <code>{entryId}</code>
      </InlineEntryCard>
    )
  };

  getEntitySys() {
    const data = this.props.node.data;
    return {
      id: data.get('target').sys.id,
      type: data.get('target').sys.linkType
    };
  }

  handleEditClick = entry => {
    this.props.widgetAPI.navigator.openEntry(entry.sys.id, { slideIn: true });
  };

  handleRemoveClick = () => {
    const { editor, node } = this.props;
    editor.removeNodeByKey(node.key);
  };

  render() {
    const { widgetAPI, editor, isSelected, onEntityFetchComplete, renderEntity } = this.props;
    const isDisabled = editor.props.readOnly;
    const isReadOnly = editor.props.actionsDisabled;
    const { id: entryId } = this.getEntitySys();
    const props = {
      widgetAPI,
      entryId,
      isSelected,
      isDisabled,
      isReadOnly,
      onEntityFetchComplete,
      onRemove: this.handleRemoveClick,
      onOpenEntity: this.handleEditClick
    };
    return (
      <span {...this.props.attributes} className={styles.root}>
        {renderEntity(props)}
      </span>
    );
  }
}

export default EmbeddedEntryInline;
