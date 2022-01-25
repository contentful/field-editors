import * as React from 'react';

import { FormatItalicIcon } from '@contentful/f36-icons';
import { MARKS } from '@contentful/rich-text-types';
import { createItalicPlugin as createDefaultItalicPlugin } from '@udecode/plate-basic-marks';
import { toggleMark, isMarkActive, someHtmlElement } from '@udecode/plate-core';
import { css } from 'emotion';
import * as Slate from 'slate-react';

import { useContentfulEditor } from '../../ContentfulEditorProvider';
import { maybeFocus } from '../../helpers/editor';
import { RichTextPlugin } from '../../types';
import { ToolbarButton } from '../shared/ToolbarButton';

interface ToolbarItalicButtonProps {
  isDisabled?: boolean;
}

export function ToolbarItalicButton(props: ToolbarItalicButtonProps) {
  const editor = useContentfulEditor();

  function handleClick() {
    if (!editor?.selection) return;

    toggleMark(editor, { key: MARKS.ITALIC });
    maybeFocus(editor);
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

export const createItalicPlugin = (): RichTextPlugin =>
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
