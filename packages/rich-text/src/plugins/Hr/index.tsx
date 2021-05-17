import * as React from 'react';
import * as Slate from 'slate-react';
import { css, cx } from 'emotion';
import tokens from '@contentful/forma-36-tokens';
import { Transforms, Editor } from 'slate';
import { BLOCKS } from '@contentful/rich-text-types';
import { useCustomEditor } from '../../hooks/useCustomEditor';
import { CustomEditor } from 'types';

const styles = {
  container: css`
    margin: 0 0 ${tokens.spacingL};
  `,
  hr: css`
    height: ${tokens.spacingM};
    background: transparent;
    position: relative;
    border: 0;
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
  invisibleChildren: css`
    display: none;
  `,
};

export function withHrEvents(editor: CustomEditor, event: KeyboardEvent) {
  // const [element] = editor.getFragment();
  // if (event.keyCode === 13 && element?.type === 'hr') {
  //   event.preventDefault();
  //   const hasText = editor.getFragment().some(node => {
  //     console.log({ node });
  //   })
  // }
}

export function ToolbarHrButton() {
  const editor = useCustomEditor();

  function handleOnClick() {
    const hr = {
      type: BLOCKS.HR,
      children: [{ text: '' }],
    };

    const paragraph = {
      type: BLOCKS.PARAGRAPH,
      children: [{ text: '' }],
    };

    const hasText = editor.selection
      ? Editor.node(editor, editor.selection.focus.path).some(
          (node) => node.text && node.text !== ''
        )
      : false;

    if (editor.children.length <= 1 || hasText) {
      Transforms.insertNodes(editor, hr);
    } else {
      Transforms.setNodes(editor, hr);
    }

    Transforms.insertNodes(editor, paragraph);

    Slate.ReactEditor.focus(editor);
  }

  return (
    <button onClick={handleOnClick} type="button">
      Hr {editor.isBlockSelected('blockquote') ? 'selected' : 'not selected'}
    </button>
  );
}

export function Hr(props: Slate.RenderLeafProps) {
  const isSelected = Slate.useSelected();

  return (
    <div {...props.attributes} className={styles.container}>
      <hr className={cx(styles.hr, isSelected && styles.hrSelected)} />
      <div className={styles.invisibleChildren}>{props.children}</div>
    </div>
  );
}
