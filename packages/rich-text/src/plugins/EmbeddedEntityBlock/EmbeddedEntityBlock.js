import React from 'react';
import PropTypes from 'prop-types';
import { Card } from '@contentful/forma-36-react-components';
import { css } from 'emotion';

const styles = {
  root: css({
    'margin-bottom': '1.25rem'
  })
};

export default class LinkedEntityBlock extends React.Component {
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
    renderEntity: ({ entityId, entityType, isSelected }) => (
      <Card selected={isSelected}>
        {entityType} <code>{entityId}</code>
      </Card>
    )
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
    const { navigator } = this.props.widgetAPI;
    const openEntity = type === 'Asset' ? navigator.openAsset : navigator.openEntry;
    return openEntity(id, { slideIn: true });
  };

  handleRemoveClick = () => {
    const { editor, node } = this.props;
    editor.moveToRangeOfNode(node);
    editor.removeNodeByKey(node.key);
    editor.focus(); // Click on "x" might have removed focus.
  };

  render() {
    const { widgetAPI, editor, isSelected, onEntityFetchComplete, renderEntity } = this.props;
    const isDisabled = editor.props.readOnly;
    const isReadOnly = editor.props.actionsDisabled;
    const { id: entityId, type: entityType } = this.getEntitySys();
    const props = {
      widgetAPI,
      entityType,
      entityId,
      isSelected,
      isDisabled,
      isReadOnly,
      onEntityFetchComplete,
      onRemove: this.handleRemoveClick,
      onOpenEntity: this.handleEditClick
    };
    return (
      <div {...this.props.attributes} className={styles.root}>
        {renderEntity(props)}
      </div>
    );
  }
}
