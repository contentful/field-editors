import React from 'react';
import { useSelected, useReadOnly } from 'slate-react';
import { useContentfulEditor } from '../../ContentfulEditorProvider';
import { findNodePath, removeNodes } from '../../internal';
import { useSdkContext } from '../../SdkProvider';
import { useLinkTracking } from '../links-tracking';
import { LinkedInlineWrapper } from '../shared/LinkedInlineWrapper';
import { FetchingWrappedResourceInlineCard } from './FetchingWrappedResourceInlineCard';
export function LinkedResourceInline(props) {
    const { attributes, children, element } = props;
    const { onEntityFetchComplete } = useLinkTracking();
    const isSelected = useSelected();
    const editor = useContentfulEditor();
    const sdk = useSdkContext();
    const isDisabled = useReadOnly();
    const link = element.data.target.sys;
    function handleRemoveClick() {
        if (!editor) return;
        const pathToElement = findNodePath(editor, element);
        removeNodes(editor, {
            at: pathToElement
        });
    }
    return /*#__PURE__*/ React.createElement(LinkedInlineWrapper, {
        attributes: attributes,
        link: element.data.target,
        card: /*#__PURE__*/ React.createElement(FetchingWrappedResourceInlineCard, {
            sdk: sdk,
            link: link,
            isDisabled: isDisabled,
            isSelected: isSelected,
            onRemove: handleRemoveClick,
            onEntityFetchComplete: onEntityFetchComplete
        })
    }, children);
}
