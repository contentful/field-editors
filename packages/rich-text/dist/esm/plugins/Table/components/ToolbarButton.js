import * as React from 'react';
import { TableIcon } from '@contentful/f36-icons';
import { useContentfulEditor } from '../../../ContentfulEditorProvider';
import { focus } from '../../../helpers/editor';
import { ToolbarButton } from '../../shared/ToolbarButton';
import { insertTableAndFocusFirstCell, isTableActive } from './../helpers';
export function ToolbarTableButton(props) {
    const editor = useContentfulEditor();
    const isActive = editor && isTableActive(editor);
    async function handleClick() {
        if (!editor) return;
        editor.tracking.onToolbarAction('insertTable');
        insertTableAndFocusFirstCell(editor);
        focus(editor);
    }
    if (!editor) return null;
    return /*#__PURE__*/ React.createElement(ToolbarButton, {
        title: "Table",
        testId: "table-toolbar-button",
        onClick: handleClick,
        isActive: !!isActive,
        isDisabled: props.isDisabled
    }, /*#__PURE__*/ React.createElement(TableIcon, null));
}
