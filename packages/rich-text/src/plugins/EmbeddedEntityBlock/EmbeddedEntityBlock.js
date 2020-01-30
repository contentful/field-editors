import React from 'react';
import PropTypes from 'prop-types';
import FetchedEntityCard from 'app/widgets/shared/FetchedEntityCard';

class LinkedEntityBlock extends React.Component {
  static propTypes = {
    widgetAPI: PropTypes.object.isRequired,
    onEntityFetchComplete: PropTypes.func,
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
    const { type, id } = this.getEntitySys();
    this.props.widgetAPI.navigator.openEntity(type, id, { slideIn: true });
  };

  handleRemoveClick = () => {
    const { editor, node } = this.props;
    editor.moveToRangeOfNode(node);
    editor.removeNodeByKey(node.key);
    editor.focus(); // Click on "x" removes focus.
  };

  render() {
    const { editor, isSelected, onEntityFetchComplete } = this.props;
    const isDisabled = editor.props.readOnly;
    const readOnly = editor.props.actionsDisabled;
    const { id: entityId, type: entityType } = this.getEntitySys();
    return (
      <div {...this.props.attributes}>
        <FetchedEntityCard
          entityType={entityType}
          entityId={entityId}
          readOnly={readOnly}
          disabled={isDisabled}
          editable={true}
          selected={isSelected}
          onEntityFetchComplete={onEntityFetchComplete}
          onEdit={this.handleEditClick}
          onRemove={this.handleRemoveClick}
          className="rich-text__entity-card"
        />
      </div>
    );
  }
}

export default LinkedEntityBlock;
