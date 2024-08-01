import * as React from 'react';

import { EntityLink } from '@contentful/field-editor-reference';
import { useReadOnly, useSelected } from 'slate-react';

import { useContentfulEditor } from '../../ContentfulEditorProvider';
import { findNodePath } from '../../internal/queries';
import { removeNodes } from '../../internal/transforms';
import { Element, RenderElementProps } from '../../internal/types';
import { useSdkContext } from '../../SdkProvider';
import { useLinkTracking } from '../links-tracking';
import { FetchingWrappedAssetCard } from '../shared/FetchingWrappedAssetCard';
import { FetchingWrappedEntryCard } from '../shared/FetchingWrappedEntryCard';
import { LinkedBlockWrapper } from '../shared/LinkedBlockWrapper';

type LinkedEntityBlockProps = {
  element: Element & {
    data: {
      target: EntityLink;
    };
  };
  attributes: Pick<RenderElementProps, 'attributes'>;
  children: React.ReactNode;
};

export function LinkedEntityBlock(props: LinkedEntityBlockProps) {
  const { attributes, children, element } = props;
  const { onEntityFetchComplete } = useLinkTracking();
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
    const pathToElement = findNodePath(editor, element);
    removeNodes(editor, { at: pathToElement });
  }, [editor, element]);

  return (
    <LinkedBlockWrapper
      attributes={attributes}
      card={
        <>
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
        </>
      }
      link={element.data.target}
    >
      {children}
    </LinkedBlockWrapper>
  );
}
