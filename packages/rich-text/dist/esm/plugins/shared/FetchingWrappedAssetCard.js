import * as React from 'react';
import { AssetCard, DragHandle } from '@contentful/f36-components';
import { useEntity, useEntityLoader, MissingEntityCard, WrappedAssetCard } from '@contentful/field-editor-reference';
import { useLocalePublishStatus, useActiveLocales, useReleaseStatus } from '@contentful/field-editor-shared';
import areEqual from 'fast-deep-equal';
const InternalAssetCard = /*#__PURE__*/ React.memo(({ asset, sdk, isDisabled, isSelected, locale, onEdit, onRemove, loadEntityScheduledActions, localesStatusMap, release, releaseStatusMap, releaseEntityStatus })=>{
    const activeLocales = useActiveLocales(sdk);
    return /*#__PURE__*/ React.createElement(WrappedAssetCard, {
        getEntityScheduledActions: loadEntityScheduledActions,
        size: "small",
        isSelected: isSelected,
        isDisabled: isDisabled,
        localeCode: locale,
        defaultLocaleCode: sdk.locales.default,
        asset: asset,
        onEdit: onEdit,
        onRemove: isDisabled ? undefined : onRemove,
        isClickable: false,
        useLocalizedEntityStatus: sdk.parameters.instance.useLocalizedEntityStatus,
        localesStatusMap: localesStatusMap,
        activeLocales: activeLocales,
        renderDragHandle: !isDisabled ? (dragHandleProps)=>/*#__PURE__*/ React.createElement(DragHandle, {
                label: "drag embedded asset",
                ...dragHandleProps
            }) : undefined,
        releaseStatusMap: releaseStatusMap,
        release: release,
        releaseEntityStatus: releaseEntityStatus
    });
}, areEqual);
InternalAssetCard.displayName = 'InternalAssetCard';
export function FetchingWrappedAssetCard(props) {
    const { onEntityFetchComplete } = props;
    const { data: asset, status, currentEntity } = useEntity('Asset', props.assetId);
    const { getEntityScheduledActions } = useEntityLoader();
    const loadEntityScheduledActions = React.useCallback(()=>getEntityScheduledActions('Asset', props.assetId), [
        getEntityScheduledActions,
        props.assetId
    ]);
    const localesStatusMap = useLocalePublishStatus(asset, props.sdk.locales);
    const { releaseStatusMap, releaseEntityStatus } = useReleaseStatus({
        entity: asset,
        previousEntityOnTimeline: currentEntity,
        locales: props.sdk.locales,
        release: props.sdk.release,
        isReference: true
    });
    React.useEffect(()=>{
        if (status === 'success') {
            onEntityFetchComplete?.();
        }
    }, [
        onEntityFetchComplete,
        status
    ]);
    if (status === 'loading' || status === 'idle') {
        return /*#__PURE__*/ React.createElement(AssetCard, {
            size: "default",
            isLoading: true
        });
    }
    if (status === 'error') {
        return /*#__PURE__*/ React.createElement(MissingEntityCard, {
            isDisabled: props.isDisabled,
            onRemove: props.onRemove,
            providerName: "Contentful"
        });
    }
    return /*#__PURE__*/ React.createElement(InternalAssetCard, {
        asset: asset,
        sdk: props.sdk,
        isDisabled: props.isDisabled,
        isSelected: props.isSelected,
        loadEntityScheduledActions: loadEntityScheduledActions,
        locale: props.locale,
        onEdit: props.onEdit,
        onRemove: props.onRemove,
        localesStatusMap: localesStatusMap,
        releaseStatusMap: releaseStatusMap,
        release: props.sdk.release,
        releaseEntityStatus: releaseEntityStatus
    });
}
