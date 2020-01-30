import React from 'react';
import PropTypes from 'prop-types';
import {
  InlineEntryCard,
  DropdownListItem,
  DropdownList
} from '@contentful/forma-36-react-components';

import { default as FetchEntity, RequestStatus } from 'app/widgets/shared/FetchEntity';
import WidgetAPIContext from 'app/widgets/WidgetApi/WidgetApiContext';
import { INLINES } from '@contentful/rich-text-types';

class EmbeddedEntryInline extends React.Component {
  static propTypes = {
    widgetAPI: PropTypes.object.isRequired,
    isSelected: PropTypes.bool.isRequired,
    attributes: PropTypes.object.isRequired,
    editor: PropTypes.object.isRequired,
    node: PropTypes.object.isRequired,
    onEntityFetchComplete: PropTypes.func
  };

  handleEditClick = entry => {
    this.props.widgetAPI.navigator.openEntry(entry.sys.id, { slideIn: true });
  };

  handleRemoveClick = () => {
    const { editor, node } = this.props;
    editor.removeNodeByKey(node.key);
  };

  renderMissingNode() {
    const { isSelected } = this.props;

    return (
      <InlineEntryCard testId={INLINES.EMBEDDED_ENTRY} selected={isSelected}>
        Entry missing or inaccessible
      </InlineEntryCard>
    );
  }

  renderNode({ requestStatus, contentTypeName, entity, entityTitle, entityStatus }) {
    const isLoading = requestStatus === RequestStatus.Pending && !entity;
    return (
      <InlineEntryCard
        testId={INLINES.EMBEDDED_ENTRY}
        selected={this.props.isSelected}
        title={`${contentTypeName}: ${entityTitle}`}
        status={entityStatus}
        className="rich-text__inline-reference-card"
        isLoading={isLoading}
        dropdownListElements={
          !this.props.editor.props.actionsDisabled ? (
            <DropdownList>
              <DropdownListItem onClick={() => this.handleEditClick(entity)}>Edit</DropdownListItem>
              <DropdownListItem
                onClick={this.handleRemoveClick}
                isDisabled={this.props.editor.props.readOnly}>
                Remove
              </DropdownListItem>
            </DropdownList>
          ) : null
        }>
        {entityTitle || 'Untitled'}
      </InlineEntryCard>
    );
  }

  render() {
    const { onEntityFetchComplete } = this.props;
    const entryId = this.props.node.data.get('target').sys.id;

    return (
      <WidgetAPIContext.Consumer>
        {({ widgetAPI }) => (
          <FetchEntity
            widgetAPI={widgetAPI}
            entityId={entryId}
            entityType="Entry"
            localeCode={widgetAPI.field.locale}
            render={fetchEntityResult => {
              if (fetchEntityResult.requestStatus !== RequestStatus.Pending) {
                onEntityFetchComplete && onEntityFetchComplete();
              }
              if (fetchEntityResult.requestStatus === RequestStatus.Error) {
                return this.renderMissingNode();
              } else {
                return this.renderNode(fetchEntityResult);
              }
            }}
          />
        )}
      </WidgetAPIContext.Consumer>
    );
  }
}

export default EmbeddedEntryInline;
