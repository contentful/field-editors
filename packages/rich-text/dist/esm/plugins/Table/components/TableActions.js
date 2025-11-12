import * as React from 'react';
import { IconButton, Menu } from '@contentful/f36-components';
import { CaretDownIcon } from '@contentful/f36-icons';
import { BLOCKS } from '@contentful/rich-text-types';
import { deleteColumn, deleteRow, deleteTable } from '@udecode/plate-table';
import { css } from 'emotion';
import { useContentfulEditor } from '../../../ContentfulEditorProvider';
import { getNodeEntryFromSelection, getTableSize } from '../../../helpers/editor';
import { withoutNormalizing } from '../../../internal';
import { useReadOnly } from '../../../internal/hooks';
import { getAboveNode } from '../../../internal/queries';
import { addColumnLeft, addColumnRight, addRowAbove, addRowBelow, setHeader } from '../actions';
import { isTableHeaderEnabled } from '../helpers';
export const styles = {
    topRight: css({
        position: 'absolute',
        insetBlockStart: '6px',
        insetInlineEnd: '5px'
    })
};
const getCurrentTableSize = (editor)=>{
    const [table] = getNodeEntryFromSelection(editor, BLOCKS.TABLE);
    return table ? getTableSize(table) : null;
};
export const TableActions = ()=>{
    const editor = useContentfulEditor();
    const isDisabled = useReadOnly();
    const [isOpen, setOpen] = React.useState(false);
    const [isHeaderEnabled, setHeaderEnabled] = React.useState(false);
    const close = React.useCallback(()=>{
        setOpen(false);
    }, []);
    React.useEffect(()=>{
        setHeaderEnabled(Boolean(editor && isTableHeaderEnabled(editor)));
    }, [
        editor
    ]);
    const canInsertRowAbove = React.useMemo(()=>{
        if (!editor) {
            return false;
        }
        const headerCell = getAboveNode(editor, {
            match: {
                type: BLOCKS.TABLE_HEADER_CELL
            }
        });
        return !headerCell;
    }, [
        editor
    ]);
    const toggleHeader = React.useCallback(()=>{
        close();
        if (!editor) {
            return;
        }
        const value = !isHeaderEnabled;
        setHeaderEnabled(value);
        setHeader(editor, value);
    }, [
        editor,
        close,
        isHeaderEnabled
    ]);
    const action = React.useCallback((cb, type, element)=>()=>{
            if (!editor?.selection) return;
            close();
            const tableSize = getCurrentTableSize(editor);
            withoutNormalizing(editor, ()=>{
                cb(editor, {
                    header: isHeaderEnabled
                });
            });
            const actionName = `${type}Table${element === 'Table' ? '' : element}`;
            editor.tracking.onViewportAction(actionName, {
                tableSize
            });
        }, [
        editor,
        isHeaderEnabled,
        close
    ]);
    if (isDisabled) {
        return null;
    }
    return /*#__PURE__*/ React.createElement(Menu, {
        placement: "left",
        isOpen: isOpen,
        onOpen: ()=>{
            setOpen(true);
        },
        onClose: close
    }, /*#__PURE__*/ React.createElement(Menu.Trigger, null, /*#__PURE__*/ React.createElement(IconButton, {
        size: "small",
        variant: "transparent",
        tabIndex: -1,
        className: styles.topRight,
        icon: /*#__PURE__*/ React.createElement(CaretDownIcon, null),
        "aria-label": "Open table menu",
        testId: "cf-table-actions-button"
    })), /*#__PURE__*/ React.createElement(Menu.List, null, /*#__PURE__*/ React.createElement(Menu.Item, {
        onClick: action(addRowAbove, 'insert', 'Row'),
        disabled: !canInsertRowAbove
    }, "Add row above"), /*#__PURE__*/ React.createElement(Menu.Item, {
        onClick: action(addRowBelow, 'insert', 'Row')
    }, "Add row below"), /*#__PURE__*/ React.createElement(Menu.Item, {
        onClick: action(addColumnLeft, 'insert', 'Column')
    }, "Add column left"), /*#__PURE__*/ React.createElement(Menu.Item, {
        onClick: action(addColumnRight, 'insert', 'Column')
    }, "Add column right"), /*#__PURE__*/ React.createElement(Menu.Divider, null), /*#__PURE__*/ React.createElement(Menu.Item, {
        onClick: toggleHeader
    }, isHeaderEnabled ? 'Disable table header' : 'Enable table header'), /*#__PURE__*/ React.createElement(Menu.Divider, null), /*#__PURE__*/ React.createElement(Menu.Item, {
        onClick: action(deleteRow, 'remove', 'Row')
    }, "Delete row"), /*#__PURE__*/ React.createElement(Menu.Item, {
        onClick: action(deleteColumn, 'remove', 'Column')
    }, "Delete column"), /*#__PURE__*/ React.createElement(Menu.Item, {
        onClick: action(deleteTable, 'remove', 'Table')
    }, "Delete table")));
};
