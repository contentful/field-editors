import * as React from 'react';
import * as Slate from 'slate-react';
import { css, cx } from 'emotion';
import tokens from '@contentful/forma-36-tokens';
import { EditorToolbarButton } from '@contentful/forma-36-react-components';
import { Transforms } from 'slate';
import { BLOCKS } from '@contentful/rich-text-types';
import {
  getSlatePluginTypes,
  getRenderElement,
  useStoreEditor,
  SlatePlugin,
  SPEditor,
  isElement,
} from '@udecode/slate-plugins-core';
import { getText, setNodes, insertNodes, getNodes } from '@udecode/slate-plugins-common';
import { isBlockSelected } from '../../helpers/editor';
import { CustomSlatePluginOptions } from 'types';

const styles = {
  container: css`
    margin: 0 0 ${tokens.spacingL};
  `,
  hr: css`
    margin: 0;
    height: ${tokens.spacingM};
    background: transparent;
    position: relative;
    border: 0;
    user-select: none;
    &:hover {
      cursor: pointer;
    }
    &::after {
      content: '';
      position: absolute;
      width: 100%;
      height: 1px;
      background: ${tokens.colorElementMid};
      top: 50%;
    }
  `,
  hrSelected: css`
    &::after {
      background: ${tokens.colorPrimary};
      -webkit-box-shadow: 0px 0px 5px ${tokens.colorPrimary};
      box-shadow: 0px 0px 5px ${tokens.colorPrimary};
    }
  `,
};

interface ToolbarHrButtonProps {
  isDisabled?: boolean;
}

export function withHrEvents(editor: SPEditor) {
  return (event) => {
    if (!editor.selection) return;

    const isEnter = event.keyCode === 13;
    const [currentHrNode] = getNodes(editor, {
      at: editor.selection.focus.path,
      match: (node) => isElement(node) && node.type === BLOCKS.HR,
    });
    const isCurrentBlockHr = !!currentHrNode;

    if (isEnter && isCurrentBlockHr) {
      event.preventDefault();

      Transforms.move(editor, { distance: 1 });
    }
  };
}

export function ToolbarHrButton(props: ToolbarHrButtonProps) {
  const editor = useStoreEditor();

  function handleOnClick() {
    if (!editor?.selection) return;

    const hr = {
      type: BLOCKS.HR,
      children: [{ text: '' }],
      isVoid: true,
    };

    const paragraph = {
      type: BLOCKS.PARAGRAPH,
      children: [{ text: '' }],
    };

    const hasText = !!getText(editor, editor.selection.focus.path);

    hasText ? insertNodes(editor, hr) : setNodes(editor, hr);

    insertNodes(editor, paragraph);

    Slate.ReactEditor.focus(editor);
  }

  return (
    <EditorToolbarButton
      icon="HorizontalRule"
      tooltip="HR"
      label="HR"
      disabled={props.isDisabled}
      onClick={handleOnClick}
      testId="hr-toolbar-button"
      isActive={isBlockSelected(editor, BLOCKS.HR)}
    />
  );
}

export function Hr(props: Slate.RenderLeafProps) {
  const isSelected = Slate.useSelected();
  const isFocused = Slate.useFocused();

  return (
    <div {...props.attributes} className={styles.container}>
      <div contentEditable={false}>
        <hr className={cx(styles.hr, isSelected && isFocused ? styles.hrSelected : undefined)} />
      </div>
      {props.children}
    </div>
  );
}

export function createHrPlugin(): SlatePlugin {
  return {
    renderElement: getRenderElement(BLOCKS.HR),
    pluginKeys: BLOCKS.HR,
    onKeyDown: withHrEvents,
    voidTypes: getSlatePluginTypes(BLOCKS.HR),
  };
}

export const withHrOptions: CustomSlatePluginOptions = {
  [BLOCKS.HR]: {
    type: BLOCKS.HR,
    component: Hr,
  },
};
