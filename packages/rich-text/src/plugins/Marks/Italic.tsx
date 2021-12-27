import * as React from 'react';
import * as Slate from 'slate-react';
import { css } from 'emotion';
import { PlatePlugin } from '@udecode/plate-core';
import { toggleMark, isMarkActive, someHtmlElement } from '@udecode/plate-core';
import { createItalicPlugin as createDefaultItalicPlugin } from '@udecode/plate-basic-marks';
import { MARKS } from '@contentful/rich-text-types';
import { FormatItalicIcon } from '@contentful/f36-icons';
import { ToolbarButton } from '../shared/ToolbarButton';
import { useContentfulEditor } from '../../ContentfulEditorProvider';

interface ToolbarItalicButtonProps {
  isDisabled?: boolean;
}

export function ToolbarItalicButton(props: ToolbarItalicButtonProps) {
  const editor = useContentfulEditor();

  function handleClick() {
    if (!editor?.selection) return;

    toggleMark(editor, { key: MARKS.ITALIC });
    Slate.ReactEditor.focus(editor);
  }

  if (!editor) return null;

  return (
    <ToolbarButton
      title="Italic"
      testId="italic-toolbar-button"
      onClick={handleClick}
      isActive={isMarkActive(editor, MARKS.ITALIC)}
      isDisabled={props.isDisabled}>
      <FormatItalicIcon />
    </ToolbarButton>
  );
}

const styles = {
  italic: css({
    fontStyle: 'italic',
  }),
};

export function Italic(props: Slate.RenderLeafProps) {
  return (
    <em {...props.attributes} className={styles.italic}>
      {props.children}
    </em>
  );
}

export const createItalicPlugin = (): PlatePlugin =>
  createDefaultItalicPlugin({
    type: MARKS.ITALIC,
    component: Italic,
    options: {
      hotkey: ['mod+i'],
    },
    deserializeHtml: {
      rules: [
        { validNodeName: ['I', 'EM'] },
        {
          validStyle: {
            fontStyle: 'italic',
          },
        },
      ],
      query: (el) => {
        return !someHtmlElement(el, (node) => node.style.fontStyle === 'normal');
      },
    },
  });
