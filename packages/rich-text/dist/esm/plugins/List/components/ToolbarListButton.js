import * as React from 'react';
import { ListBulletsIcon, ListNumbersIcon, CheckIcon } from '@contentful/f36-icons';
import { BLOCKS } from '@contentful/rich-text-types';
import { useContentfulEditor } from '../../../ContentfulEditorProvider';
import { focus } from '../../../helpers/editor';
import { isNodeTypeEnabled } from '../../../helpers/validations';
import { getBlockAbove, isElement } from '../../../internal/queries';
import { useSdkContext } from '../../../SdkProvider';
import { ToolbarButton } from '../../shared/ToolbarButton';
import { toggleList } from '../transforms/toggleList';
import { isListTypeActive } from '../utils';
export function ToolbarListButton(props) {
    const sdk = useSdkContext();
    const editor = useContentfulEditor();
    function handleClick(type, listStyle) {
        return ()=>{
            if (!editor?.selection) return;
            toggleList(editor, {
                type,
                listStyle
            });
            focus(editor);
        };
    }
    function isCheckmarkListActive() {
        if (!editor) return false;
        const isInUL = isListTypeActive(editor, BLOCKS.UL_LIST);
        if (!isInUL) return false;
        const listNode = getBlockAbove(editor, {
            match: {
                type: BLOCKS.UL_LIST
            },
            mode: 'lowest'
        });
        if (listNode && isElement(listNode[0])) {
            const nodeData = listNode[0].data || {};
            return nodeData.listStyle === 'none';
        }
        return false;
    }
    if (!editor) return null;
    return /*#__PURE__*/ React.createElement(React.Fragment, null, isNodeTypeEnabled(sdk.field, BLOCKS.UL_LIST) && /*#__PURE__*/ React.createElement(ToolbarButton, {
        title: "UL",
        testId: "ul-toolbar-button",
        onClick: handleClick(BLOCKS.UL_LIST),
        isActive: isListTypeActive(editor, BLOCKS.UL_LIST) && !isCheckmarkListActive(),
        isDisabled: props.isDisabled
    }, /*#__PURE__*/ React.createElement(ListBulletsIcon, null)), isNodeTypeEnabled(sdk.field, BLOCKS.OL_LIST) && /*#__PURE__*/ React.createElement(ToolbarButton, {
        title: "OL",
        testId: "ol-toolbar-button",
        onClick: handleClick(BLOCKS.OL_LIST),
        isActive: isListTypeActive(editor, BLOCKS.OL_LIST),
        isDisabled: props.isDisabled
    }, /*#__PURE__*/ React.createElement(ListNumbersIcon, null)), isNodeTypeEnabled(sdk.field, BLOCKS.UL_LIST) && /*#__PURE__*/ React.createElement(ToolbarButton, {
        title: "Checkmark List",
        testId: "checkmark-list-toolbar-button",
        onClick: handleClick(BLOCKS.UL_LIST, 'none'),
        isActive: isCheckmarkListActive(),
        isDisabled: props.isDisabled
    }, /*#__PURE__*/ React.createElement(CheckIcon, null)));
}
