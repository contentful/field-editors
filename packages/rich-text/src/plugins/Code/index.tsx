import * as React from 'react';
import * as Slate from 'slate-react';
import { css } from 'emotion';
import {
  SlatePlugin,
  getRenderLeaf,
  useStoreEditor,
  GetNodeDeserializerRule,
} from '@udecode/slate-plugins-core';
import { MARKS } from '@contentful/rich-text-types';
import { getToggleMarkOnKeyDown, isMarkActive, toggleMark } from '@udecode/slate-plugins-common';
import { EditorToolbarButton } from '@contentful/forma-36-react-components';
import { CustomSlatePluginOptions } from 'types';
import { deserializeLeaf } from '../../helpers/deserializer';

interface ToolbarCodeButtonProps {
  isDisabled?: boolean;
}

export function ToolbarCodeButton(props: ToolbarCodeButtonProps) {
  const editor = useStoreEditor();

  function handleClick() {
    if (!editor?.selection) return;

    toggleMark(editor, MARKS.CODE);
    Slate.ReactEditor.focus(editor);
  }

  if (!editor) return null;

  return (
    <EditorToolbarButton
      icon="Code"
      tooltip="Code"
      tooltipPlace="bottom"
      label="Code"
      testId="code-toolbar-button"
      onClick={handleClick}
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
  const deserializeRule: GetNodeDeserializerRule[] = [
    { nodeNames: ['CODE', 'PRE'] },
    { style: { fontFamily: 'monospace' } },
  ];

  return {
    pluginKeys: MARKS.CODE,
    renderLeaf: getRenderLeaf(MARKS.CODE),
    onKeyDown: getToggleMarkOnKeyDown(MARKS.CODE),
    deserialize: deserializeLeaf(MARKS.CODE, deserializeRule),
  };
}

export const withCodeOptions: CustomSlatePluginOptions = {
  [MARKS.CODE]: {
    type: MARKS.CODE,
    component: Code,
    hotkey: ['mod+/'],
  },
};
