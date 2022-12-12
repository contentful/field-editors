import * as React from 'react';

import { HorizontalRuleIcon } from '@contentful/f36-icons';
import tokens from '@contentful/f36-tokens';
import { BLOCKS } from '@contentful/rich-text-types';
import { css, cx } from 'emotion';
import * as Slate from 'slate-react';

import { useContentfulEditor } from '../../ContentfulEditorProvider';
import {
  getNodeEntryFromSelection,
  isBlockSelected,
  moveToTheNextLine,
  focus,
} from '../../helpers/editor';
import { getText } from '../../internal/queries';
import { insertNodes, setNodes, removeNodes } from '../../internal/transforms';
import { PlatePlugin, PlateEditor } from '../../internal/types';
import { ToolbarButton } from '../shared/ToolbarButton';

const styles = {
  container: css`
    margin: 0 0 ${tokens.spacingL};
  `,
  hr: css`
    margin: 0;
    height: ${tokens.spacingM};
    background: transparent;
    position: relative;
    border: 0;
    user-select: none;
    &:hover {
      cursor: pointer;
    }
    &::after {
      content: '';
      position: absolute;
      width: 100%;
      height: 1px;
      background: ${tokens.gray300};
      top: 50%;
    }
  `,
  hrSelected: css`
    &::after {
      background: ${tokens.colorPrimary};
      -webkit-box-shadow: 0px 0px 5px ${tokens.colorPrimary};
      box-shadow: 0px 0px 5px ${tokens.colorPrimary};
    }
  `,
};

interface ToolbarHrButtonProps {
  isDisabled?: boolean;
}

export function withHrEvents(editor: PlateEditor) {
  return (event: React.KeyboardEvent) => {
    if (!editor) return;

    const [, pathToSelectedHr] = getNodeEntryFromSelection(editor, BLOCKS.HR);
    if (pathToSelectedHr) {
      const isBackspace = event.key === 'Backspace';
      const isDelete = event.key === 'Delete';
      if (isBackspace || isDelete) {
        event.preventDefault();
        removeNodes(editor, { at: pathToSelectedHr });
      }
    }
  };
}

export function ToolbarHrButton(props: ToolbarHrButtonProps) {
  const editor = useContentfulEditor();

  function handleOnClick() {
    if (!editor?.selection) return;

    const hr = {
      type: BLOCKS.HR,
      data: {},
      children: [{ text: '' }],
      isVoid: true,
    };

    const hasText = !!getText(editor, editor.selection.focus.path);
    hasText ? insertNodes(editor, hr) : setNodes(editor, hr);

    // Move focus to the next paragraph (added by TrailingParagraph plugin)
    moveToTheNextLine(editor);

    focus(editor);
  }

  if (!editor) return null;

  return (
    <ToolbarButton
      title="HR"
      isDisabled={props.isDisabled}
      onClick={handleOnClick}
      testId="hr-toolbar-button"
      isActive={isBlockSelected(editor, BLOCKS.HR)}>
      <HorizontalRuleIcon />
    </ToolbarButton>
  );
}

export function Hr(props: Slate.RenderLeafProps) {
  const isSelected = Slate.useSelected();
  const isFocused = Slate.useFocused();

  return (
    <div
      {...props.attributes}
      className={styles.container}
      // COMPAT: To make HR copyable in Safari, we verify this attribute below on `deserialize`
      data-void-element={BLOCKS.HR}>
      <div
        draggable={true}
        // Moving `contentEditable` to this div makes it to be selectable when being the first void element, e.g pressing ctrl + a to select everything
        contentEditable={false}>
        <hr className={cx(styles.hr, isSelected && isFocused ? styles.hrSelected : undefined)} />
      </div>
      {props.children}
    </div>
  );
}

export const createHrPlugin = (): PlatePlugin => ({
  key: BLOCKS.HR,
  type: BLOCKS.HR,
  isVoid: true,
  isElement: true,
  component: Hr,
  handlers: {
    onKeyDown: withHrEvents,
  },
  deserializeHtml: {
    rules: [
      {
        validNodeName: ['HR'],
      },
      {
        validAttribute: {
          'data-void-element': BLOCKS.HR,
        },
      },
    ],
    withoutChildren: true,
  },
});
