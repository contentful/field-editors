import * as React from 'react';
import { useReadOnly, useSelected } from 'slate-react';
import { useContentfulEditor } from '../../ContentfulEditorProvider';
import { findNodePath } from '../../internal/queries';
import { removeNodes } from '../../internal/transforms';
import { useSdkContext } from '../../SdkProvider';
import { useLinkTracking } from '../links-tracking';
import { FetchingWrappedAssetCard } from '../shared/FetchingWrappedAssetCard';
import { FetchingWrappedEntryCard } from '../shared/FetchingWrappedEntryCard';
import { LinkedBlockWrapper } from '../shared/LinkedBlockWrapper';
export function LinkedEntityBlock(props) {
    const { attributes, children, element } = props;
    const { onEntityFetchComplete } = useLinkTracking();
    const isSelected = useSelected();
    const editor = useContentfulEditor();
    const sdk = useSdkContext();
    const isDisabled = useReadOnly();
    const { id: entityId, linkType: entityType } = element.data.target.sys;
    const handleEditClick = React.useCallback(()=>{
        const openEntity = entityType === 'Asset' ? sdk.navigator.openAsset : sdk.navigator.openEntry;
        return openEntity(entityId, {
            slideIn: true
        });
    }, [
        sdk,
        entityId,
        entityType
    ]);
    const handleRemoveClick = React.useCallback(()=>{
        if (!editor) return;
        const pathToElement = findNodePath(editor, element);
        removeNodes(editor, {
            at: pathToElement
        });
    }, [
        editor,
        element
    ]);
    return /*#__PURE__*/ React.createElement(LinkedBlockWrapper, {
        attributes: attributes,
        card: /*#__PURE__*/ React.createElement(React.Fragment, null, entityType === 'Entry' && /*#__PURE__*/ React.createElement(FetchingWrappedEntryCard, {
            sdk: sdk,
            entryId: entityId,
            locale: sdk.field.locale,
            isDisabled: isDisabled,
            isSelected: isSelected,
            onRemove: handleRemoveClick,
            onEdit: handleEditClick,
            onEntityFetchComplete: onEntityFetchComplete
        }), entityType === 'Asset' && /*#__PURE__*/ React.createElement(FetchingWrappedAssetCard, {
            sdk: sdk,
            assetId: entityId,
            locale: sdk.field.locale,
            isDisabled: isDisabled,
            isSelected: isSelected,
            onRemove: handleRemoveClick,
            onEdit: handleEditClick,
            onEntityFetchComplete: onEntityFetchComplete
        })),
        link: element.data.target
    }, children);
}
