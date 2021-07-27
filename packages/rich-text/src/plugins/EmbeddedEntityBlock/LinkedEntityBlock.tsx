import React from 'react';
import { css } from 'emotion';
import { FetchingWrappedEntryCard } from '../shared/FetchingWrappedEntryCard';
import { FetchingWrappedAssetCard } from '../shared/FetchingWrappedAssetCard';
import { useSdkContext } from '../../SdkProvider';
import { useStoreEditor } from '@udecode/slate-plugins-core';
import { CustomElement } from 'types';
import { ReactEditor, useSelected } from 'slate-react';
import { Transforms } from 'slate';

const styles = {
  root: css({
    marginBottom: '1.25rem',
  }),
};

type EntityElement = CustomElement & {
  data: {
    target: {
      sys: {
        id: string;
        linkType: 'Entry' | 'Asset';
        type: 'Link';
      };
    };
  };
};

interface LinkedEntityBlockProps {
  attributes: object;
  children: [{ text: '' }];
  element: EntityElement;
  onEntityFetchComplete: () => void;
}

export function LinkedEntityBlock(props: LinkedEntityBlockProps) {
  const { attributes, children, element, onEntityFetchComplete } = props;
  const isSelected = useSelected();
  const editor = useStoreEditor();
  const sdk = useSdkContext();
  const { id: entityId, linkType: entityType } = element.data.target.sys;

  const handleEditClick = () => {
    const openEntity = entityType === 'Asset' ? sdk.navigator.openAsset : sdk.navigator.openEntry;
    return openEntity(entityId, { slideIn: true });
  };

  const handleRemoveClick = () => {
    if (!editor) return;
    const pathToElement = ReactEditor.findPath(editor, element);
    Transforms.removeNodes(editor, { at: pathToElement });
  };

  // TODO: fixme -- props not available on new editor
  const isDisabled = false; // editor.props.readOnly || editor.props.actionsDisabled;
  return (
    <div {...attributes} className={styles.root}>
      <div contentEditable={false}>
        {entityType === 'Entry' && (
          <FetchingWrappedEntryCard
            sdk={sdk}
            entryId={entityId}
            locale={sdk.field.locale}
            isDisabled={isDisabled}
            isSelected={isSelected}
            onRemove={handleRemoveClick}
            onEdit={handleEditClick}
            getEntryUrl={() => {
              const getEntryUrl = sdk.parameters.instance.getEntryUrl;
              return typeof getEntryUrl === 'function' ? getEntryUrl(entityId) : '';
            }}
            onEntityFetchComplete={onEntityFetchComplete}
          />
        )}
        {entityType === 'Asset' && (
          <FetchingWrappedAssetCard
            sdk={sdk}
            assetId={entityId}
            locale={sdk.field.locale}
            isDisabled={isDisabled}
            isSelected={isSelected}
            onRemove={handleRemoveClick}
            onEdit={handleEditClick}
            getAssetUrl={() => {
              const getAssetUrl = sdk.parameters.instance.getAssetUrl;
              return typeof getAssetUrl === 'function' ? getAssetUrl(entityId) : '';
            }}
            onEntityFetchComplete={onEntityFetchComplete}
          />
        )}
      </div>
      {children}
    </div>
  );
}
