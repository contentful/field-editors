import * as React from 'react';
import { DragHandle, EntryCard } from '@contentful/f36-components';
import { useEntity, MissingEntityCard, WrappedEntryCard, useEntityLoader } from '@contentful/field-editor-reference';
import { useLocalePublishStatus, useActiveLocales, useReleaseStatus } from '@contentful/field-editor-shared';
import areEqual from 'fast-deep-equal';
const InternalEntryCard = /*#__PURE__*/ React.memo(({ entry, sdk, loadEntityScheduledActions, releaseStatusMap, release, releaseEntityStatus, isSelected, isDisabled, locale, onEdit, onRemove, localesStatusMap })=>{
    const contentType = sdk.space.getCachedContentTypes().find((contentType)=>contentType.sys.id === entry.sys.contentType.sys.id);
    const activeLocales = useActiveLocales(sdk);
    return /*#__PURE__*/ React.createElement(WrappedEntryCard, {
        size: "default",
        getAsset: (assetId)=>sdk.cma.asset.get({
                assetId
            }),
        getEntityScheduledActions: loadEntityScheduledActions,
        isSelected: isSelected,
        isDisabled: isDisabled,
        localeCode: locale,
        defaultLocaleCode: sdk.locales.default,
        contentType: contentType,
        entry: entry,
        onEdit: onEdit,
        onRemove: isDisabled ? undefined : onRemove,
        isClickable: false,
        useLocalizedEntityStatus: sdk.parameters.instance.useLocalizedEntityStatus,
        localesStatusMap: localesStatusMap,
        activeLocales: activeLocales,
        renderDragHandle: !isDisabled ? (dragHandleProps)=>/*#__PURE__*/ React.createElement(DragHandle, {
                label: "drag embedded entry",
                ...dragHandleProps
            }) : undefined,
        releaseStatusMap: releaseStatusMap,
        release: release,
        releaseEntityStatus: releaseEntityStatus
    });
}, areEqual);
InternalEntryCard.displayName = 'ReferenceCard';
export const FetchingWrappedEntryCard = (props)=>{
    const { entryId, onEntityFetchComplete } = props;
    const { data: entry, status, currentEntity } = useEntity('Entry', entryId);
    const { getEntityScheduledActions } = useEntityLoader();
    const loadEntityScheduledActions = React.useCallback(()=>getEntityScheduledActions('Entry', entryId), [
        getEntityScheduledActions,
        entryId
    ]);
    const localesStatusMap = useLocalePublishStatus(entry, props.sdk.locales);
    const { releaseStatusMap, releaseEntityStatus } = useReleaseStatus({
        entity: entry,
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
        return /*#__PURE__*/ React.createElement(EntryCard, {
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
    return /*#__PURE__*/ React.createElement(InternalEntryCard, {
        entry: entry,
        sdk: props.sdk,
        locale: props.locale,
        isDisabled: props.isDisabled,
        isSelected: props.isSelected,
        onEdit: props.onEdit,
        onRemove: props.onRemove,
        loadEntityScheduledActions: loadEntityScheduledActions,
        localesStatusMap: localesStatusMap,
        releaseStatusMap: releaseStatusMap,
        release: props.sdk.release,
        releaseEntityStatus: releaseEntityStatus
    });
};
