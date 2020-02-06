import React from 'react';
import PropTypes from 'prop-types';
// TODO:xxx Define custom renderer via props?
//import FetchedEntityCard from 'app/widgets/shared/FetchedEntityCard';
import { css } from 'emotion';

const styles = {
  root: css({
    'margin-bottom': '1.25rem'
  })
};

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
    // TODO: xxx
    // const { editor, isSelected, onEntityFetchComplete } = this.props;
    // const isDisabled = editor.props.readOnly;
    // const readOnly = editor.props.actionsDisabled;
    const { id: entityId, type: entityType } = this.getEntitySys();
    return (
      <div {...this.props.attributes}>
        <div>
          Entity {entityId} ({entityType})
        </div>
        // TODO:xxx
        {/*<FetchedEntityCard*/}
        {/*  entityType={entityType}*/}
        {/*  entityId={entityId}*/}
        {/*  readOnly={readOnly}*/}
        {/*  disabled={isDisabled}*/}
        {/*  editable={true}*/}
        {/*  selected={isSelected}*/}
        {/*  onEntityFetchComplete={onEntityFetchComplete}*/}
        {/*  onEdit={this.handleEditClick}*/}
        {/*  onRemove={this.handleRemoveClick}*/}
        {/*  className={styles.root}*/}
        {/*/>*/}
      </div>
    );
  }
}

export default LinkedEntityBlock;
