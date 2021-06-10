import * as React from 'react';
import * as Slate from 'slate-react';
import { css } from 'emotion';
import { SlatePlugin, getRenderLeaf, useStoreEditor } from '@udecode/slate-plugins-core';
import { getToggleMarkOnKeyDown, toggleMark, isMarkActive } from '@udecode/slate-plugins-common';
import { MARKS } from '@contentful/rich-text-types';
import { EditorToolbarButton } from '@contentful/forma-36-react-components';
import { CustomSlatePluginOptions } from 'types';

interface ToolbarItalicButtonProps {
  isDisabled?: boolean;
}

export function ToolbarItalicButton(props: ToolbarItalicButtonProps) {
  const editor = useStoreEditor();

  if (!editor) return null;

  return (
    <EditorToolbarButton
      icon="FormatItalic"
      tooltip="Italic"
      label="Italic"
      onClick={() => toggleMark(editor, MARKS.ITALIC)}
      isActive={isMarkActive(editor, MARKS.ITALIC)}
      disabled={props.isDisabled}
    />
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

export function createItalicPlugin(): SlatePlugin {
  return {
    pluginKeys: MARKS.ITALIC,
    renderLeaf: getRenderLeaf(MARKS.ITALIC),
    onKeyDown: getToggleMarkOnKeyDown(MARKS.ITALIC),
  };
}

export const withItalicOptions: CustomSlatePluginOptions = {
  [MARKS.ITALIC]: {
    type: MARKS.ITALIC,
    component: Italic,
    hotkey: ['mod+i'],
  },
};
