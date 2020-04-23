import React from 'react';
import PropTypes from 'prop-types';
import { css } from 'emotion';
import { FetchingWrappedEntryCard } from './FetchingWrappedEntryCard';
import { FetchingWrappedAssetCard } from './FetchingWrappedAssetCard';

const styles = {
  root: css({
    marginBottom: '1.25rem'
  })
};

export default class LinkedEntityBlock extends React.Component {
  static propTypes = {
    sdk: PropTypes.object.isRequired,
    isSelected: PropTypes.bool.isRequired,
    attributes: PropTypes.object.isRequired,
    editor: PropTypes.object.isRequired,
    node: PropTypes.object.isRequired,
    onEntityFetchComplete: PropTypes.func.isRequired
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
    const { navigator } = this.props.sdk;
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
    const { sdk, editor, isSelected } = this.props;
    const isDisabled = editor.props.readOnly || editor.props.actionsDisabled;
    const { id: entityId, type: entityType } = this.getEntitySys();
    return (
      <div {...this.props.attributes} className={styles.root}>
        {entityType === 'Entry' && (
          <FetchingWrappedEntryCard
            sdk={sdk}
            entryId={entityId}
            locale={sdk.field.locale}
            isDisabled={isDisabled}
            isSelected={isSelected}
            onRemove={this.handleRemoveClick}
            onEdit={this.handleEditClick}
            getEntryUrl={() => {
              const getEntryUrl = sdk.parameters.instance.getEntryUrl;
              return typeof getEntryUrl === 'function' ? getEntryUrl(entityId) : '';
            }}
            onEntityFetchComplete={this.props.onEntityFetchComplete}
          />
        )}
        {entityType === 'Asset' && (
          <FetchingWrappedAssetCard
            sdk={sdk}
            assetId={entityId}
            locale={sdk.field.locale}
            isDisabled={isDisabled}
            isSelected={isSelected}
            onRemove={this.handleRemoveClick}
            onEdit={this.handleEditClick}
            getAssetUrl={() => {
              const getAssetUrl = sdk.parameters.instance.getAssetUrl;
              return typeof getAssetUrl === 'function' ? getAssetUrl(entityId) : '';
            }}
            onEntityFetchComplete={this.props.onEntityFetchComplete}
          />
        )}
      </div>
    );
  }
}
