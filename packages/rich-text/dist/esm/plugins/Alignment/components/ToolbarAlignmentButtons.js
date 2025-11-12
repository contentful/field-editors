import * as React from 'react';
import { TextAlignLeftIcon, TextAlignCenterIcon, TextAlignRightIcon } from '@contentful/f36-icons';
import { useContentfulEditor } from '../../../ContentfulEditorProvider';
import { focus } from '../../../helpers/editor';
import { ToolbarButton } from '../../shared/ToolbarButton';
import { setAlignment, isAlignmentActive } from '../alignment';
export function ToolbarAlignmentButtons(props) {
    const editor = useContentfulEditor();
    function handleClick(alignment) {
        return ()=>{
            if (!editor?.selection) return;
            setAlignment(editor, alignment);
            focus(editor);
        };
    }
    if (!editor) return null;
    return /*#__PURE__*/ React.createElement(React.Fragment, null, /*#__PURE__*/ React.createElement(ToolbarButton, {
        title: "Align Left",
        testId: "align-left-toolbar-button",
        onClick: handleClick('left'),
        isActive: isAlignmentActive(editor, 'left'),
        isDisabled: props.isDisabled
    }, /*#__PURE__*/ React.createElement(TextAlignLeftIcon, null)), /*#__PURE__*/ React.createElement(ToolbarButton, {
        title: "Align Center",
        testId: "align-center-toolbar-button",
        onClick: handleClick('center'),
        isActive: isAlignmentActive(editor, 'center'),
        isDisabled: props.isDisabled
    }, /*#__PURE__*/ React.createElement(TextAlignCenterIcon, null)), /*#__PURE__*/ React.createElement(ToolbarButton, {
        title: "Align Right",
        testId: "align-right-toolbar-button",
        onClick: handleClick('right'),
        isActive: isAlignmentActive(editor, 'right'),
        isDisabled: props.isDisabled
    }, /*#__PURE__*/ React.createElement(TextAlignRightIcon, null)));
}
