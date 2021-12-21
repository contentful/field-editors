import * as React from 'react';
import * as Slate from 'slate-react';
import { css } from 'emotion';
import { PlatePlugin, getRenderLeaf, GetNodeDeserializerRule } from '@udecode/plate-core';
import { getToggleMarkOnKeyDown, toggleMark, isMarkActive } from '@udecode/plate-core';
import { MARKS } from '@contentful/rich-text-types';
import { FormatItalicIcon } from '@contentful/f36-icons';
import { ToolbarButton } from '../shared/ToolbarButton';
import { CustomSlatePluginOptions } from '../../types';
import { deserializeLeaf } from '../../helpers/deserializer';
import { useContentfulEditor } from '../../ContentfulEditorProvider';

interface ToolbarItalicButtonProps {
  isDisabled?: boolean;
}

export function ToolbarItalicButton(props: ToolbarItalicButtonProps) {
  const editor = useContentfulEditor();

  function handleClick() {
    if (!editor?.selection) return;

    toggleMark(editor, MARKS.ITALIC);
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

export function createItalicPlugin(): PlatePlugin {
  const deserializeRules: GetNodeDeserializerRule[] = [
    { nodeNames: ['I', 'EM'] },
    {
      style: {
        fontStyle: ['italic'],
      },
    },
  ];

  return {
    pluginKeys: MARKS.ITALIC,
    renderLeaf: getRenderLeaf(MARKS.ITALIC),
    onKeyDown: getToggleMarkOnKeyDown(MARKS.ITALIC),
    deserialize: deserializeLeaf(MARKS.ITALIC, deserializeRules),
  };
}

export const withItalicOptions: CustomSlatePluginOptions = {
  [MARKS.ITALIC]: {
    type: MARKS.ITALIC,
    component: Italic,
    hotkey: ['mod+i'],
  },
};
