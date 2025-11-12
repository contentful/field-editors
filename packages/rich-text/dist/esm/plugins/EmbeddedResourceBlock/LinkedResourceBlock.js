import React from 'react';
import { useSelected, useReadOnly } from 'slate-react';
import { useContentfulEditor } from '../../ContentfulEditorProvider';
import { findNodePath, removeNodes } from '../../internal';
import { useSdkContext } from '../../SdkProvider';
import { useLinkTracking } from '../links-tracking';
import { FetchingWrappedResourceCard } from '../shared/FetchingWrappedResourceCard';
import { LinkedBlockWrapper } from '../shared/LinkedBlockWrapper';
export function LinkedResourceBlock(props) {
    const { attributes, children, element } = props;
    const { onEntityFetchComplete } = useLinkTracking();
    const isSelected = useSelected();
    const editor = useContentfulEditor();
    const sdk = useSdkContext();
    const isDisabled = useReadOnly();
    const link = element.data.target.sys;
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
        link: element.data.target,
        card: /*#__PURE__*/ React.createElement(FetchingWrappedResourceCard, {
            sdk: sdk,
            link: link,
            isDisabled: isDisabled,
            isSelected: isSelected,
            onRemove: handleRemoveClick,
            onEntityFetchComplete: onEntityFetchComplete
        })
    }, children);
}
