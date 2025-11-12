import * as React from 'react';
import { QuotesIcon } from '@contentful/f36-icons';
import { BLOCKS } from '@contentful/rich-text-types';
import { useContentfulEditor } from '../../../ContentfulEditorProvider';
import { isBlockSelected, focus } from '../../../helpers/editor';
import { ToolbarButton } from '../../shared/ToolbarButton';
import { toggleQuote } from '../toggleQuote';
export function ToolbarQuoteButton(props) {
    const editor = useContentfulEditor();
    function handleOnClick() {
        if (!editor) return;
        toggleQuote(editor, editor.tracking.onToolbarAction);
        focus(editor);
    }
    if (!editor) return null;
    return /*#__PURE__*/ React.createElement(ToolbarButton, {
        title: "Blockquote",
        onClick: handleOnClick,
        testId: "quote-toolbar-button",
        isDisabled: props.isDisabled,
        isActive: isBlockSelected(editor, BLOCKS.QUOTE)
    }, /*#__PURE__*/ React.createElement(QuotesIcon, null));
}
