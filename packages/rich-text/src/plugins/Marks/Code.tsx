import * as React from 'react';

import { CodeIcon } from '@contentful/f36-icons';
import { MARKS } from '@contentful/rich-text-types';
import { createCodePlugin as createDefaultCodePlugin } from '@udecode/plate-basic-marks';
import { isMarkActive, toggleMark } from '@udecode/plate-core';
import { css } from 'emotion';
import * as Slate from 'slate-react';

import { useContentfulEditor } from '../../ContentfulEditorProvider';
import { RichTextPlugin } from '../../types';
import { ToolbarButton } from '../shared/ToolbarButton';

interface ToolbarCodeButtonProps {
  isDisabled?: boolean;
}

export function ToolbarCodeButton(props: ToolbarCodeButtonProps) {
  const editor = useContentfulEditor();

  function handleClick() {
    if (!editor?.selection) return;

    toggleMark(editor, { key: MARKS.CODE });
    Slate.ReactEditor.focus(editor);
  }

  if (!editor) return null;

  return (
    <ToolbarButton
      title="Code"
      testId="code-toolbar-button"
      onClick={handleClick}
      isActive={isMarkActive(editor, MARKS.CODE)}
      isDisabled={props.isDisabled}>
      <CodeIcon />
    </ToolbarButton>
  );
}

const styles = {
  code: css({
    fontFamily: 'monospace',
    fontSize: '.9em',
  }),
};

export function Code(props: Slate.RenderLeafProps) {
  return (
    <code {...props.attributes} className={styles.code}>
      {props.children}
    </code>
  );
}

export const createCodePlugin = (): RichTextPlugin =>
  createDefaultCodePlugin({
    type: MARKS.CODE,
    component: Code,
    options: {
      hotkey: ['mod+/'],
    },
    deserializeHtml: {
      rules: [
        {
          validNodeName: ['CODE', 'PRE'],
        },
        {
          validStyle: {
            fontFamily: ['Consolas', 'monospace'],
          },
        },
      ],
    },
  });
