import * as React from 'react';
import * as Slate from 'slate-react';
import { css, cx } from 'emotion';
import tokens from '@contentful/forma-36-tokens';
import { EditorToolbarButton } from '@contentful/forma-36-react-components';
import { Transforms, Editor } from 'slate';
import { BLOCKS } from '@contentful/rich-text-types';
import { useCustomEditor } from '../../hooks/useCustomEditor';
import { CustomElement } from 'types';

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
      background: ${tokens.colorElementMid};
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

export function withHrEvents(editor, event) {
  const [currentFragment] = Editor.fragment(editor, editor.selection.focus.path) as CustomElement[];
  const isEnter = event.keyCode === 13;
  const isCurrentBlockHr = currentFragment.type === BLOCKS.HR;

  if (isEnter && isCurrentBlockHr) {
    event.preventDefault();

    Transforms.move(editor, { distance: 1 });
  }
}

export function ToolbarHrButton(props: ToolbarHrButtonProps) {
  const editor = useCustomEditor();

  function handleOnClick() {
    const hr = {
      type: BLOCKS.HR,
      children: [{ text: '' }],
      isVoid: true,
    };

    const paragraph = {
      type: BLOCKS.PARAGRAPH,
      children: [{ text: '' }],
    };

    if (editor.children.length <= 1 || editor.hasSelectionText()) {
      Transforms.insertNodes(editor, hr);
    } else {
      Transforms.setNodes(editor, hr);
    }

    Transforms.insertNodes(editor, paragraph);

    Slate.ReactEditor.focus(editor);
  }

  return (
    <EditorToolbarButton
      icon="HorizontalRule"
      tooltip="HR"
      label="HR"
      disabled={props.isDisabled}
      onClick={handleOnClick}
      testId="hr-toolbar-button"
    />
  );
}

export function Hr(props: Slate.RenderLeafProps) {
  const isSelected = Slate.useSelected();
  const isFocused = Slate.useFocused();

  return (
    <div {...props.attributes} className={styles.container}>
      <div contentEditable={false}>
        <hr className={cx(styles.hr, isSelected && isFocused ? styles.hrSelected : undefined)} />
      </div>
      {props.children}
    </div>
  );
}
