import React from 'react';
import * as Slate from 'slate-react';

import { Flex, Button, Tooltip } from '@contentful/f36-components';
import { TextIcon } from '@contentful/f36-icons';
import tokens from '@contentful/f36-tokens';
import { css, cx } from 'emotion';

import {
    CustomToolbarProps,
    getText,
    insertNodes,
    PlateEditor,
    PlatePlugin,
    removeNodes,
    setNodes,
} from '../../../src/internal';
import { useContentfulEditor } from '../../../src/ContentfulEditorProvider';
import { focus, getNodeEntryFromSelection, moveToTheNextLine } from '../../../src/helpers/editor';
import { CustomAddonConfiguration } from '../../../src/plugins';

// Somewhat copied from the native toolbar so the test looks reasonably normal
const styles:Record<'toolbar'|'container'|'renderContainer'|'renderSelected', string> = {
    container: css({
        margin: `0 0 ${tokens.spacingL}`,
    }),
    toolbar: css({
        // This allows us to hide the bottom border from the native toolbar, making the custom one, in this case, look seamless
        marginTop: -1,
        border: `1px solid ${tokens.gray400}`,
        borderTop: 0,
        backgroundColor: tokens.gray100,
        padding: tokens.spacingXs,
    }),
    renderContainer: css({
        //
        border: `1px solid rgb(155 149 132)`,
        background: `rgb(247 239 214)`,
        padding: tokens.spacingM,
        borderRadius: tokens.spacingL,
    }),
    renderSelected: css({
        border: `1px solid ${tokens.blue400}`,
        boxShadow: `0 0 0 2px ${tokens.blue400}`,
    }),
};

export const lipsumBlockID = 'custom_lipsum';

const LipsumToolbar = ({ isDisabled }: CustomToolbarProps) => {
    const editor = useContentfulEditor();

    const handleClick = React.useCallback(() => {
        if (!editor?.selection) {
            return;
        }

        const lipsum = {
            type: lipsumBlockID,
            data: {},
            children: [{ text: '' }],
            isVoid: true,
        };

        // Borrowed without modifications from the HR plugin
        const hasText = !!getText(editor, editor.selection.focus.path);
        hasText ? insertNodes(editor, lipsum) : setNodes(editor, lipsum);

        // Move focus to the next paragraph (added by TrailingParagraph plugin)
        moveToTheNextLine(editor);

        focus(editor);
    }, [editor]);

    if (!editor) {
        return null;
    }

    return <Flex aria-disabled={isDisabled} className={styles.toolbar} testId="custom-toolbar">
        <Tooltip
            content="Insert Lorem ipsum Text"
            testId="custom-toolbar"
            placement={'bottom'}
            usePortal={true}
            isDisabled={isDisabled}
        >
            <Button
                isDisabled={isDisabled}
                title="Insert Lipsum text"
                testId="custom-toolbar-lipsum-button"
                startIcon={<TextIcon />}
                variant="transparent"
                onClick={handleClick}
            >Insert Lipsum text</Button>
        </Tooltip>
    </Flex>
}

export const lipsumComponent = (props: Slate.RenderLeafProps) => {
    const isSelected = Slate.useSelected();

    return (
        <div
            {...props.attributes}
            className={styles.container}
            data-void-element={lipsumBlockID}>
            <div
                draggable={true}
                // Moving `contentEditable` to this div makes it to be selectable when being the first void element, e.g pressing ctrl + a to select everything
                contentEditable={false}>
                <div className={cx(styles.renderContainer, (isSelected ? styles.renderSelected : undefined))}>
                    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
                </div>
            </div>
            {props.children}
        </div>
    );
}

/**
 * Taken almost identically from HR Events.  We need to delete the node, treating its contents as a void instead of editable text
 *
 * @param editor
 */
export const withLipsumEvents = (editor: PlateEditor) => {
    return (event: React.KeyboardEvent) => {
        if (!editor) {
            return;
        }

        const [, pathToSelectedLipsumNode] = getNodeEntryFromSelection(editor, lipsumBlockID);

        if (pathToSelectedLipsumNode) {
            const isBackspace = event.key === 'Backspace';
            const isDelete = event.key === 'Delete';

            if (isBackspace || isDelete) {
                event.preventDefault();

                removeNodes(editor, { at: pathToSelectedLipsumNode });
            }
        }
    };
}

const LipsumPlugin = (): PlatePlugin => ({
    key: lipsumBlockID,
    type: lipsumBlockID,
    isVoid: true,
    isElement: true,
    component: lipsumComponent,
    handlers: {
        onKeyDown: withLipsumEvents,
    },
});

export const lipsumPlugin:CustomAddonConfiguration = {
    lipsum: {
        plugin: LipsumPlugin,
        toolbar: LipsumToolbar,
    },
};
