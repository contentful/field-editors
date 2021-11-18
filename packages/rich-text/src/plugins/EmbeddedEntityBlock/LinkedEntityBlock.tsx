import React from 'react';
import { css } from 'emotion';
import { FetchingWrappedEntryCard } from '../shared/FetchingWrappedEntryCard';
import { FetchingWrappedAssetCard } from '../shared/FetchingWrappedAssetCard';
import { useSdkContext } from '../../SdkProvider';
import { CustomRenderElementProps } from '../../types';
import { ReactEditor, useSelected, useReadOnly } from 'slate-react';
import { Transforms } from 'slate';
import { useContentfulEditor } from '../../ContentfulEditorProvider';
import { HAS_BEFORE_INPUT_SUPPORT } from '../../helpers/environment';

const styles = {
  root: css({
    marginBottom: '1.25rem',
  }),
};

type LinkedEntityBlockProps = CustomRenderElementProps<{
  target: {
    sys: {
      id: string;
      linkType: 'Entry' | 'Asset';
      type: 'Link';
    };
  };
}>;

export function LinkedEntityBlock(props: LinkedEntityBlockProps) {
  const { attributes, children, element } = props;
  const isSelected = useSelected();
  const editor = useContentfulEditor();
  const sdk = useSdkContext();
  const isDisabled = useReadOnly();
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

  return (
    <div
      {...attributes}
      className={styles.root}
      data-entity-type={entityType}
      data-entity-id={entityId}
      // COMPAT: This makes copy & paste work for Firefox
      contentEditable={!HAS_BEFORE_INPUT_SUPPORT ? false : undefined}
      draggable={!HAS_BEFORE_INPUT_SUPPORT ? true : undefined}>
      <div
        // COMPAT: This makes copy & paste work for Chromium/Blink browsers and Safari
        contentEditable={HAS_BEFORE_INPUT_SUPPORT ? false : undefined}
        draggable={HAS_BEFORE_INPUT_SUPPORT ? true : undefined}>
        {entityType === 'Entry' && (
          <FetchingWrappedEntryCard
            sdk={sdk}
            entryId={entityId}
            locale={sdk.field.locale}
            isDisabled={isDisabled}
            isSelected={isSelected}
            onRemove={handleRemoveClick}
            onEdit={handleEditClick}
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
          />
        )}
      </div>
      {children}
    </div>
  );
}
