import React from 'react';
import { ArrowArcRightIcon } from '@contentful/f36-icons';
import { useContentfulEditor } from '../../ContentfulEditorProvider';
import { ToolbarButton } from '../../plugins/shared/ToolbarButton';
export const ButtonRedo = ()=>{
    const editor = useContentfulEditor();
    const onClickHandler = ()=>{
        editor.redo('toolbar');
    };
    return /*#__PURE__*/ React.createElement(ToolbarButton, {
        title: "Redo",
        testId: "redo-toolbar-button",
        onClick: onClickHandler,
        isActive: false,
        isDisabled: editor.history.redos.length === 0
    }, /*#__PURE__*/ React.createElement(ArrowArcRightIcon, null));
};
