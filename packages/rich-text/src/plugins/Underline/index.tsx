import * as React from 'react';
import * as Slate from 'slate-react';
import { PlatePlugin, getRenderLeaf, GetNodeDeserializerRule } from '@udecode/plate-core';
import { MARKS } from '@contentful/rich-text-types';
import { getToggleMarkOnKeyDown, toggleMark, isMarkActive } from '@udecode/plate-common';
import { FormatUnderlinedIcon } from '@contentful/f36-icons';
import { ToolbarButton } from '../shared/ToolbarButton';
import { CustomSlatePluginOptions } from 'types';
import { deserializeLeaf } from '../../helpers/deserializer';
import { useContentfulEditor } from '../../ContentfulEditorProvider';

interface ToolbarUnderlineButtonProps {
  isDisabled?: boolean;
}

export function ToolbarUnderlineButton(props: ToolbarUnderlineButtonProps) {
  const editor = useContentfulEditor();

  function handleClick() {
    if (!editor?.selection) return;

    toggleMark(editor, MARKS.UNDERLINE);
    Slate.ReactEditor.focus(editor);
  }

  if (!editor) return null;

  return (
    <ToolbarButton
      title="Underline"
      testId="underline-toolbar-button"
      onClick={handleClick}
      isActive={isMarkActive(editor, MARKS.UNDERLINE)}
      isDisabled={props.isDisabled}>
      <FormatUnderlinedIcon />
    </ToolbarButton>
  );
}

export function Underline(props: Slate.RenderLeafProps) {
  return <u {...props.attributes}>{props.children}</u>;
}

export function createUnderlinePlugin(): PlatePlugin {
  const deserializeRules: GetNodeDeserializerRule[] = [
    { nodeNames: ['U'] },
    {
      style: {
        textDecoration: ['underline'],
      },
    },
  ];

  return {
    pluginKeys: MARKS.UNDERLINE,
    renderLeaf: getRenderLeaf(MARKS.UNDERLINE),
    onKeyDown: getToggleMarkOnKeyDown(MARKS.UNDERLINE),
    deserialize: deserializeLeaf(MARKS.UNDERLINE, deserializeRules),
  };
}

export const withUnderlineOptions: CustomSlatePluginOptions = {
  [MARKS.UNDERLINE]: {
    type: MARKS.UNDERLINE,
    component: Underline,
    hotkey: ['mod+u'],
  },
};
