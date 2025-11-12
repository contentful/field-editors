import * as React from 'react';
import { DragHandle, EntryCard } from '@contentful/f36-components';
import { ResourceEntityErrorCard, WrappedEntryCard, useResource } from '@contentful/field-editor-reference';
import areEqual from 'fast-deep-equal';
const InternalEntryCard = /*#__PURE__*/ React.memo((props)=>{
    if (props.data === undefined || props.status === 'loading') {
        return /*#__PURE__*/ React.createElement(EntryCard, {
            isLoading: true
        });
    }
    const { contentType, resource: entry, space } = props.data;
    return /*#__PURE__*/ React.createElement(WrappedEntryCard, {
        size: "default",
        getAsset: ()=>Promise.resolve(),
        isSelected: props.isSelected,
        isDisabled: props.isDisabled,
        localeCode: props.data.defaultLocaleCode,
        defaultLocaleCode: props.data.defaultLocaleCode,
        contentType: contentType,
        spaceName: space?.name,
        entry: entry,
        onEdit: props.onEdit,
        onRemove: props.isDisabled ? undefined : props.onRemove,
        isClickable: false,
        getEntityScheduledActions: ()=>Promise.resolve([]),
        useLocalizedEntityStatus: props.sdk.parameters.instance.useLocalizedEntityStatus,
        renderDragHandle: !props.isDisabled ? (dragHandleProps)=>/*#__PURE__*/ React.createElement(DragHandle, {
                label: "drag resource entry",
                ...dragHandleProps
            }) : undefined
    });
}, areEqual);
InternalEntryCard.displayName = 'ReferenceCard';
export const FetchingWrappedResourceCard = (props)=>{
    const { link, onEntityFetchComplete, sdk } = props;
    const { data, status, error } = useResource(link.linkType, link.urn, {
        locale: sdk.field.locale
    });
    React.useEffect(()=>{
        if (status === 'success') {
            onEntityFetchComplete?.();
        }
    }, [
        onEntityFetchComplete,
        status
    ]);
    if (status === 'error') {
        return /*#__PURE__*/ React.createElement(ResourceEntityErrorCard, {
            error: error,
            linkType: link.linkType,
            isSelected: props.isSelected,
            isDisabled: props.isDisabled,
            onRemove: props.onRemove
        });
    }
    return /*#__PURE__*/ React.createElement(InternalEntryCard, {
        data: data,
        status: status,
        sdk: props.sdk,
        isDisabled: props.isDisabled,
        isSelected: props.isSelected,
        onEdit: props.onEdit,
        onRemove: props.onRemove
    });
};
