import React from 'react';
import PropTypes from 'prop-types';

import { FetchingWrappedInlineEntryCard } from './FetchingWrappedInlineEntryCard';
import { styles } from './EmbeddedEntryInline.styles';

class EmbeddedEntryInline extends React.Component {
  static propTypes = {
    sdk: PropTypes.object.isRequired,
    isSelected: PropTypes.bool.isRequired,
    attributes: PropTypes.object.isRequired,
    editor: PropTypes.object.isRequired,
    node: PropTypes.object.isRequired,
    onEntityFetchComplete: PropTypes.func.isRequired,
  };

  getEntitySys() {
    const data = this.props.node.data;
    return {
      id: data.get('target').sys.id,
      type: data.get('target').sys.linkType,
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
          onEntityFetchComplete={this.props.onEntityFetchComplete}
        />
      </span>
    );
  }
}

export default EmbeddedEntryInline;
