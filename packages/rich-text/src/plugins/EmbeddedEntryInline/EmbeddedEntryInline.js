import React from 'react';
import PropTypes from 'prop-types';
import { css } from 'emotion';
import { FetchingWrappedInlineEntryCard } from './FetchingWrappedInlineEntryCard';

const styles = {
  root: css({
    margin: '0px 5px',
    fontSize: 'inherit',
    span: {
      webkitUserSelect: 'none',
      mozUserSelect: 'none',
      msUserSelect: 'none',
      userSelect: 'none'
    }
  })
};

class EmbeddedEntryInline extends React.Component {
  static propTypes = {
    sdk: PropTypes.object.isRequired,
    isSelected: PropTypes.bool.isRequired,
    attributes: PropTypes.object.isRequired,
    editor: PropTypes.object.isRequired,
    node: PropTypes.object.isRequired
  };

  getEntitySys() {
    const data = this.props.node.data;
    return {
      id: data.get('target').sys.id,
      type: data.get('target').sys.linkType
    };
  }

  handleEditClick = () => {
    const { id } = this.getEntitySys();
    return this.props.sdk.navigator.openEntry(id, { slideIn: true });
  };

  handleRemoveClick = () => {
    const { editor, node } = this.props;
    editor.removeNodeByKey(node.key);
  };

  render() {
    const { sdk, editor, isSelected } = this.props;
    const isDisabled = editor.props.readOnly;
    const isReadOnly = editor.props.actionsDisabled;
    const { id: entryId } = this.getEntitySys();
    return (
      <span {...this.props.attributes} className={styles.root}>
        <FetchingWrappedInlineEntryCard
          sdk={sdk}
          entryId={entryId}
          isSelected={isSelected}
          isDisabled={isDisabled}
          isReadOnly={isReadOnly}
          onRemove={this.handleRemoveClick}
          onEdit={this.handleEditClick}
          getEntryUrl={() => {
            const getEntryUrl = sdk.parameters.instance.getEntryUrl;
            return typeof getEntryUrl === 'function' ? getEntryUrl(entryId) : '';
          }}
        />
      </span>
    );
  }
}

export default EmbeddedEntryInline;
