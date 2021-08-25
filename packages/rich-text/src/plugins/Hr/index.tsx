import * as React from 'react';
import * as Slate from 'slate-react';
import { css, cx } from 'emotion';
import tokens from '@contentful/forma-36-tokens';
import { EditorToolbarButton } from '@contentful/forma-36-react-components';
import { Transforms } from 'slate';
import { BLOCKS } from '@contentful/rich-text-types';
import {
  getPlatePluginTypes,
  getRenderElement,
  useStoreEditorRef,
  PlatePlugin,
} from '@udecode/plate-core';
import { getText, setNodes } from '@udecode/plate-common';
import {
  getNodeEntryFromSelection,
  isBlockSelected,
  moveToTheNextLine,
} from '../../helpers/editor';
import { CustomSlatePluginOptions } from 'types';
import { deserializeElement } from '../../helpers/deserializer';

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
      background: ${tokens.gray300};
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

export function withHrEvents(editor) {
  return (event) => {
    if (!editor) return;

    const isEnter = event.keyCode === 13;
    const [, pathToSelectedHr] = getNodeEntryFromSelection(editor, BLOCKS.HR);

    if (pathToSelectedHr) {
      if (isEnter) {
        event.preventDefault();
        moveToTheNextLine(editor);
      } else if (event.key === 'Backspace') {
        event.preventDefault();
        Transforms.removeNodes(editor, { at: pathToSelectedHr });
      }
    }
  };
}

export function ToolbarHrButton(props: ToolbarHrButtonProps) {
  const editor = useStoreEditorRef();

  function handleOnClick() {
    if (!editor?.selection) return;

    const hr = {
      type: BLOCKS.HR,
      data: {},
      children: [{ text: '' }],
      isVoid: true,
    };

    const paragraph = {
      type: BLOCKS.PARAGRAPH,
      data: {},
      children: [{ text: '' }],
    };

    const hasText = !!getText(editor, editor.selection.focus.path);

    hasText ? Transforms.insertNodes(editor, hr) : setNodes(editor, hr);

    Transforms.insertNodes(editor, paragraph);

    Slate.ReactEditor.focus(editor);
  }

  if (!editor) return null;

  return (
    <EditorToolbarButton
      icon="HorizontalRule"
      tooltip="HR"
      tooltipPlace="bottom"
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

export function createHrPlugin(): PlatePlugin {
  return {
    renderElement: getRenderElement(BLOCKS.HR),
    pluginKeys: BLOCKS.HR,
    onKeyDown: withHrEvents,
    voidTypes: getPlatePluginTypes(BLOCKS.HR),
    deserialize: deserializeElement(BLOCKS.HR, [
      {
        nodeNames: ['HR'],
      },
    ]),
  };
}

export const withHrOptions: CustomSlatePluginOptions = {
  [BLOCKS.HR]: {
    type: BLOCKS.HR,
    component: Hr,
  },
};
