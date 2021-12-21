import * as React from 'react';
import * as Slate from 'slate-react';
import { css } from 'emotion';
import { PlatePlugin, getRenderLeaf, GetNodeDeserializerRule } from '@udecode/plate-core';
import { getToggleMarkOnKeyDown, isMarkActive, toggleMark } from '@udecode/plate-core';
import { MARKS } from '@contentful/rich-text-types';
import { CodeIcon } from '@contentful/f36-icons';
import { ToolbarButton } from '../shared/ToolbarButton';
import { CustomSlatePluginOptions } from 'types';
import { deserializeLeaf } from '../../helpers/deserializer';
import { useContentfulEditor } from '../../ContentfulEditorProvider';

interface ToolbarCodeButtonProps {
  isDisabled?: boolean;
}

export function ToolbarCodeButton(props: ToolbarCodeButtonProps) {
  const editor = useContentfulEditor();

  function handleClick() {
    if (!editor?.selection) return;

    toggleMark(editor, MARKS.CODE);
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

export function createCodePlugin(): PlatePlugin {
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
