import * as React from 'react';
import { LinkSimpleIcon } from '@contentful/f36-icons';
import { useContentfulEditor } from '../../../ContentfulEditorProvider';
import { isLinkActive, unwrapLink } from '../../../helpers/editor';
import { useSdkContext } from '../../../SdkProvider';
import { ToolbarButton } from '../../shared/ToolbarButton';
import { addOrEditLink } from '../HyperlinkModal';
export function ToolbarHyperlinkButton(props) {
    const editor = useContentfulEditor();
    const isActive = !!(editor && isLinkActive(editor));
    const sdk = useSdkContext();
    async function handleClick() {
        if (!editor) return;
        if (isActive) {
            unwrapLink(editor);
            editor.tracking.onToolbarAction('unlinkHyperlinks');
        } else {
            addOrEditLink(editor, sdk, editor.tracking.onToolbarAction);
        }
    }
    if (!editor) return null;
    return /*#__PURE__*/ React.createElement(ToolbarButton, {
        title: "Hyperlink",
        testId: "hyperlink-toolbar-button",
        onClick: handleClick,
        isActive: isActive,
        isDisabled: props.isDisabled
    }, /*#__PURE__*/ React.createElement(LinkSimpleIcon, null));
}
