import * as React from 'react';
import * as Slate from 'slate-react';
import { css } from 'emotion';
import { PlatePlugin } from '@udecode/plate-core';
import { isMarkActive, toggleMark } from '@udecode/plate-core';
import { createCodePlugin as createDefaultCodePlugin } from '@udecode/plate-basic-marks';
import { MARKS } from '@contentful/rich-text-types';
import { CodeIcon } from '@contentful/f36-icons';
import { ToolbarButton } from '../shared/ToolbarButton';
import { useContentfulEditor } from '../../ContentfulEditorProvider';

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

export const createCodePlugin = (): PlatePlugin =>
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
