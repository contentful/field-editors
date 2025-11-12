import * as React from 'react';
import { InlineEntryCard, MenuItem, Text } from '@contentful/f36-components';
import { useResource } from '@contentful/field-editor-reference';
import { entityHelpers } from '@contentful/field-editor-shared';
import { INLINES } from '@contentful/rich-text-types';
import { truncateTitle } from '../../plugins/shared/utils';
const { getEntryTitle, getEntityStatus } = entityHelpers;
export function FetchingWrappedResourceInlineCard(props) {
    const { link, onEntityFetchComplete, sdk } = props;
    const { data, status: requestStatus } = useResource(link.linkType, link.urn, {
        locale: sdk.field.locale
    });
    React.useEffect(()=>{
        if (requestStatus === 'success') {
            onEntityFetchComplete?.();
        }
    }, [
        onEntityFetchComplete,
        requestStatus
    ]);
    if (requestStatus === 'error') {
        return /*#__PURE__*/ React.createElement(InlineEntryCard, {
            title: "Content missing or inaccessible",
            testId: INLINES.EMBEDDED_RESOURCE,
            isSelected: props.isSelected
        });
    }
    if (requestStatus === 'loading' || data === undefined) {
        return /*#__PURE__*/ React.createElement(InlineEntryCard, {
            isLoading: true
        });
    }
    const { resource: entry, contentType, defaultLocaleCode, space } = data;
    const title = getEntryTitle({
        entry,
        contentType,
        defaultLocaleCode,
        localeCode: defaultLocaleCode,
        defaultTitle: 'Untitled'
    });
    const truncatedTitle = truncateTitle(title, 40);
    const status = getEntityStatus(entry.sys, props.sdk.parameters.instance.useLocalizedEntityStatus ? props.sdk.field.locale : undefined);
    return /*#__PURE__*/ React.createElement(InlineEntryCard, {
        testId: INLINES.EMBEDDED_RESOURCE,
        isSelected: props.isSelected,
        title: `${contentType.name}: ${truncatedTitle} (Space: ${space.name} – Env.: ${entry.sys.environment.sys.id})`,
        status: status,
        actions: [
            /*#__PURE__*/ React.createElement(MenuItem, {
                key: "remove",
                onClick: props.onRemove,
                disabled: props.isDisabled,
                testId: "delete"
            }, "Remove")
        ]
    }, /*#__PURE__*/ React.createElement(Text, null, title));
}
