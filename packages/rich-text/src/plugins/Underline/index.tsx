import * as React from 'react';
import * as Slate from 'slate-react';
import { SlatePlugin, getRenderLeaf, useStoreEditor } from '@udecode/slate-plugins-core';
import { MARKS } from '@contentful/rich-text-types';
import { getToggleMarkOnKeyDown, toggleMark, isMarkActive } from '@udecode/slate-plugins-common';
import { EditorToolbarButton } from '@contentful/forma-36-react-components';
import { CustomSlatePluginOptions } from 'types';

interface ToolbarUnderlineButtonProps {
  isDisabled?: boolean;
}

export function ToolbarUnderlineButton(props: ToolbarUnderlineButtonProps) {
  const editor = useStoreEditor();

  function handleClick() {
    if (!editor?.selection) return;

    toggleMark(editor, MARKS.UNDERLINE);
    Slate.ReactEditor.focus(editor);
  }

  if (!editor) return null;

  return (
    <EditorToolbarButton
      icon="FormatUnderlined"
      tooltip="Underline"
      label="Underline"
      onClick={handleClick}
      isActive={isMarkActive(editor, MARKS.UNDERLINE)}
      disabled={props.isDisabled}
    />
  );
}

export function Underline(props: Slate.RenderLeafProps) {
  return <u {...props.attributes}>{props.children}</u>;
}

export function createUnderlinePlugin(): SlatePlugin {
  return {
    pluginKeys: MARKS.UNDERLINE,
    renderLeaf: getRenderLeaf(MARKS.UNDERLINE),
    onKeyDown: getToggleMarkOnKeyDown(MARKS.UNDERLINE),
  };
}

export const withUnderlineOptions: CustomSlatePluginOptions = {
  [MARKS.UNDERLINE]: {
    type: MARKS.UNDERLINE,
    component: Underline,
    hotkey: ['mod+u'],
  },
};
