import * as React from 'react';
import * as Slate from 'slate-react';
import { css } from 'emotion';
import tokens from '@contentful/forma-36-tokens';
import { Transforms, Editor } from 'slate';
import { BLOCKS } from '@contentful/rich-text-types';
import { useCustomEditor } from '../../hooks/useCustomEditor';
import { CustomEditor } from 'types';

const styles = {
  blockquote: css({
    margin: '0 0 1.3125rem',
    borderLeft: `6px solid ${tokens.colorElementLight}`,
    paddingLeft: '0.875rem',
    fontStyle: 'normal',
    '& a': {
      color: 'inherit',
    },
  }),
};

export function withQuoteEvents(editor: CustomEditor, event: KeyboardEvent) {
  const [element] = editor.getFragment();
  const ENTER_KEY = 13;
  if (event.keyCode === ENTER_KEY && element?.type === 'blockquote') {
    // This doesn't do what I thought it might do, but possibly closer to cracking it!
    // Psuedo code description of what I want - if enter key is pressed and the current element is a blockquote, append the new paragraph within the currently focused blockquote
    // Transforms.wrapNodes(
    //   editor,
    //   { type: 'blockquote', children: [] },
    //   {
    //     at: editor.selection.anchor,
    //     match: (node) => Editor.isBlock(editor, node),
    //   }
    // );
  }
}

export function ToolbarQuoteButton() {
  const editor = useCustomEditor();

  console.log({ editor });

  // TODO: Multiline quotes need to implemented - check if currently in quote and hijack enter key?
  // TODO: Backspace to remove quote if quote is empty
  // TODO: Implement hotkey (mod+shift+1)
  // TODO (future): needs to account for lists

  function handleOnClick() {
    const hasText = editor.selection
      ? Editor.node(editor, editor.selection.focus.path).some(
          (node) => node.text && node.text !== ''
        )
      : false;

    const quote = {
      type: BLOCKS.QUOTE,
      children: [{ text: hasText ? 'get the content to wrap in quote block' : '' }],
    };

    const paragraph = {
      type: BLOCKS.PARAGRAPH,
      children: [{ text: '' }],
    };

    Transforms.setNodes(editor, quote);
    Transforms.insertNodes(editor, paragraph);

    Slate.ReactEditor.focus(editor);
  }

  return (
    <button onClick={handleOnClick} type="button">
      Quote {editor.isBlockSelected('blockquote') ? 'selected' : 'not selected'}
    </button>
  );
}

export function Quote(props: Slate.RenderLeafProps) {
  return (
    <blockquote {...props.attributes} className={styles.blockquote}>
      <div>{props.children}</div>
    </blockquote>
  );
}
