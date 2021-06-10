import * as React from 'react';
import * as Slate from 'slate-react';
import { css } from 'emotion';
import { SlatePlugin, getRenderLeaf, useStoreEditor } from '@udecode/slate-plugins-core';
import { MARKS } from '@contentful/rich-text-types';
import { getToggleMarkOnKeyDown, isMarkActive, toggleMark } from '@udecode/slate-plugins-common';
import { EditorToolbarButton } from '@contentful/forma-36-react-components';
import { CustomSlatePluginOptions } from 'types';

interface ToolbarCodeButtonProps {
  isDisabled?: boolean;
}

export function ToolbarCodeButton(props: ToolbarCodeButtonProps) {
  const editor = useStoreEditor();

  if (!editor) return null;

  return (
    <EditorToolbarButton
      icon="Code"
      tooltip="Code"
      label="Code"
      onClick={() => toggleMark(editor, MARKS.CODE)}
      isActive={isMarkActive(editor, MARKS.CODE)}
      disabled={props.isDisabled}
    />
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

export function createCodePlugin(): SlatePlugin {
  return {
    pluginKeys: MARKS.CODE,
    renderLeaf: getRenderLeaf(MARKS.CODE),
    onKeyDown: getToggleMarkOnKeyDown(MARKS.CODE),
  };
}

export const withCodeOptions: CustomSlatePluginOptions = {
  [MARKS.CODE]: {
    type: MARKS.CODE,
    component: Code,
    hotkey: ['mod+/'],
  },
};
