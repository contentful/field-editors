import React from 'react';
import PropTypes from 'prop-types';
import { InlineEntryCard } from '@contentful/forma-36-react-components';
import { css } from 'emotion';
import { INLINES } from '@contentful/rich-text-types';

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

  handleEditClick = entry => {
    this.props.sdk.navigator.openEntry(entry.sys.id, { slideIn: true });
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
    const props = {
      sdk,
      entryId,
      isSelected,
      isDisabled,
      isReadOnly,
      onRemove: this.handleRemoveClick,
      onOpenEntity: this.handleEditClick
    };
    return (
      <span {...this.props.attributes} className={styles.root}>
        <InlineEntryCard testId={INLINES.EMBEDDED_ENTRY} selected={props.isSelected}>
          Entry <code>{props.entryId}</code>
        </InlineEntryCard>
      </span>
    );
  }
}

export default EmbeddedEntryInline;
