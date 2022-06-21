import React from 'react';

import { css } from 'emotion';
import { Transforms } from 'slate';
import { ReactEditor, useSelected, useReadOnly } from 'slate-react';

import { useContentfulEditor } from '../../ContentfulEditorProvider';
import { IS_CHROME } from '../../helpers/environment';
import { useSdkContext } from '../../SdkProvider';
import { CustomRenderElementProps } from '../../types';
import { FetchingWrappedAssetCard } from '../shared/FetchingWrappedAssetCard';
import { FetchingWrappedEntryCard } from '../shared/FetchingWrappedEntryCard';

const styles = {
  root: css({
    marginBottom: '1.25rem !important',
    display: 'block',
  }),
  container: css({
    // The next 2 properties ensure Entity card won't be aligned above
    // a list item marker (i.e. bullet)
    display: 'inline-block',
    verticalAlign: 'text-top',
    width: '100%',
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
}> & {
  onEntityFetchComplete: VoidFunction;
};

export function LinkedEntityBlock(props: LinkedEntityBlockProps) {
  const { attributes, children, element, onEntityFetchComplete } = props;
  const isSelected = useSelected();
  const editor = useContentfulEditor();
  const sdk = useSdkContext();
  const isDisabled = useReadOnly();
  const { id: entityId, linkType: entityType } = element.data.target.sys;

  const handleEditClick = React.useCallback(() => {
    const openEntity = entityType === 'Asset' ? sdk.navigator.openAsset : sdk.navigator.openEntry;
    return openEntity(entityId, { slideIn: true });
  }, [sdk, entityId, entityType]);

  const handleRemoveClick = React.useCallback(() => {
    if (!editor) return;
    const pathToElement = ReactEditor.findPath(editor, element);
    Transforms.removeNodes(editor, { at: pathToElement });
  }, [editor, element]);

  return (
    <div
      {...attributes}
      className={styles.root}
      data-entity-type={entityType}
      data-entity-id={entityId}
      // COMPAT: This makes copy & paste work for Firefox
      contentEditable={IS_CHROME ? undefined : false}
      draggable={IS_CHROME ? true : undefined}>
      <div
        // COMPAT: This makes copy & paste work for Chromium/Blink browsers and Safari
        contentEditable={IS_CHROME ? false : undefined}
        draggable={IS_CHROME ? true : undefined}
        className={styles.container}>
        {entityType === 'Entry' && (
          <FetchingWrappedEntryCard
            sdk={sdk}
            entryId={entityId}
            locale={sdk.field.locale}
            isDisabled={isDisabled}
            isSelected={isSelected}
            onRemove={handleRemoveClick}
            onEdit={handleEditClick}
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
            onEntityFetchComplete={onEntityFetchComplete}
          />
        )}
      </div>
      {children}
    </div>
  );
}
