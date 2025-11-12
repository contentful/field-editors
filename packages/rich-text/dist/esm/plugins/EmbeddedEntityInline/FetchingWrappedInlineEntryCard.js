import * as React from 'react';
import { InlineEntryCard, MenuItem, Text } from '@contentful/f36-components';
import { ClockIcon } from '@contentful/f36-icons';
import tokens from '@contentful/f36-tokens';
import { ScheduledIconWithTooltip, useEntity, useEntityLoader } from '@contentful/field-editor-reference';
import { entityHelpers } from '@contentful/field-editor-shared';
import { INLINES } from '@contentful/rich-text-types';
import { css } from 'emotion';
const { getEntryTitle, getEntityStatus } = entityHelpers;
const styles = {
    scheduledIcon: css({
        verticalAlign: 'text-bottom',
        marginRight: tokens.spacing2Xs
    })
};
function InternalFetchingWrappedInlineEntryCard({ entry, allContentTypes, locale, defaultLocale, isSelected, entryStatus, getEntityScheduledActions, onEdit, onRemove, isDisabled }) {
    const contentType = React.useMemo(()=>{
        if (!allContentTypes) {
            return undefined;
        }
        return allContentTypes.find((contentType)=>contentType.sys.id === entry.sys.contentType.sys.id);
    }, [
        allContentTypes,
        entry
    ]);
    const title = React.useMemo(()=>getEntryTitle({
            entry,
            contentType,
            localeCode: locale,
            defaultLocaleCode: defaultLocale,
            defaultTitle: 'Untitled'
        }), [
        entry,
        contentType,
        locale,
        defaultLocale
    ]);
    return /*#__PURE__*/ React.createElement(InlineEntryCard, {
        testId: INLINES.EMBEDDED_ENTRY,
        isSelected: isSelected,
        title: contentType ? `${contentType.name}: ${title}` : title,
        status: entryStatus,
        actions: [
            /*#__PURE__*/ React.createElement(MenuItem, {
                key: "edit",
                onClick: onEdit
            }, "Edit"),
            /*#__PURE__*/ React.createElement(MenuItem, {
                key: "remove",
                onClick: onRemove,
                disabled: isDisabled,
                testId: "delete"
            }, "Remove")
        ]
    }, /*#__PURE__*/ React.createElement(ScheduledIconWithTooltip, {
        getEntityScheduledActions: getEntityScheduledActions,
        entityType: "Entry",
        entityId: entry.sys.id
    }, /*#__PURE__*/ React.createElement(ClockIcon, {
        className: styles.scheduledIcon,
        color: tokens.gray600,
        testId: "scheduled-icon"
    })), /*#__PURE__*/ React.createElement(Text, null, title));
}
export function FetchingWrappedInlineEntryCard(props) {
    const { data: entry, status: requestStatus } = useEntity('Entry', props.entryId);
    const { getEntityScheduledActions } = useEntityLoader();
    const { onEntityFetchComplete } = props;
    React.useEffect(()=>{
        if (requestStatus !== 'success') {
            return;
        }
        onEntityFetchComplete?.();
    }, [
        requestStatus,
        onEntityFetchComplete
    ]);
    if (requestStatus === 'loading' || requestStatus === 'idle') {
        return /*#__PURE__*/ React.createElement(InlineEntryCard, {
            isLoading: true
        });
    }
    if (requestStatus === 'error') {
        return /*#__PURE__*/ React.createElement(InlineEntryCard, {
            title: "Content missing or inaccessible",
            testId: INLINES.EMBEDDED_ENTRY,
            isSelected: props.isSelected
        });
    }
    const entryStatus = getEntityStatus(entry.sys, props.sdk.parameters.instance.useLocalizedEntityStatus ? props.sdk.field.locale : undefined);
    if (entryStatus === 'deleted') {
        return /*#__PURE__*/ React.createElement(InlineEntryCard, {
            title: "Content missing or inaccessible",
            testId: INLINES.EMBEDDED_ENTRY,
            isSelected: props.isSelected,
            actions: [
                /*#__PURE__*/ React.createElement(MenuItem, {
                    key: "remove",
                    onClick: props.onRemove,
                    testId: "delete"
                }, "Remove")
            ]
        });
    }
    return /*#__PURE__*/ React.createElement(InternalFetchingWrappedInlineEntryCard, {
        allContentTypes: props.sdk.space.getCachedContentTypes(),
        getEntityScheduledActions: ()=>getEntityScheduledActions('Entry', props.entryId),
        locale: props.sdk.field.locale,
        defaultLocale: props.sdk.locales.default,
        entry: entry,
        entryStatus: entryStatus,
        isDisabled: props.isDisabled,
        isSelected: props.isSelected,
        onEdit: props.onEdit,
        onRemove: props.onRemove
    });
}
