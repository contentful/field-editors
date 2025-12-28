import * as React from 'react';

import type { FieldAppSDK } from '@contentful/app-sdk';
import tokens from '@contentful/f36-tokens';
import type { Document } from '@contentful/rich-text-types';
import { ProseMirror, ProseMirrorDoc } from '@handlewithcare/react-prosemirror';
import { css, cx } from 'emotion';

import { createEditor } from '../plugins';
import { Toolbar } from './Toolbar';

export type DocProps = {
  sdk: FieldAppSDK;
  value?: Document | null;
  isDisabled: boolean;

  minHeight?: string | number;
  maxHeight?: string | number;

  toolbar?: {
    hidden?: boolean;
    stickyOffset?: number;
  };

  withCharValidation?: boolean;

  /**
   * Extra components to be rendered inside the editor hence have access
   * to the editor state.
   *
   * For internal use only. e.g. dev tools integration.
   * @internal
   */
  extraChildren?: React.ReactNode;
};

const styles = {
  container: css`
    position: relative;
  `,
  editor: css`
    padding: 20px;
    min-height: 400px;
    overflow-y: auto;
    outline: none;

    background: ${tokens.colorWhite};
    border: 1px solid ${tokens.gray400};
    border-radius: ${tokens.borderRadiusMedium};

    font-family: ${tokens.fontStackPrimary};
    font-size: ${tokens.spacingM};

    [data-test-id='toolbar'] + & {
      border-top: 0;
      border-top-left-radius: 0;
      border-top-right-radius: 0;
    }

    // Prosemirror styles
    // Ref: https://github.com/ProseMirror/prosemirror-view

    &.ProseMirror {
      position: relative;
      word-wrap: break-word;
      white-space: pre-wrap;
      white-space: break-spaces;
      font-variant-ligatures: none;
      font-feature-settings: 'liga' 0; /* the above doesn't seem to work in Edge */

      pre {
        white-space: pre-wrap;
      }

      li {
        position: relative;
      }

      [draggable][contenteditable='false'] {
        user-select: text;
      }
    }

    &.ProseMirror-hideselection {
      caret-color: transparent;

      *::selection {
        background: transparent;
      }

      *::-moz-selection {
        background: transparent;
      }
    }

    .ProseMirror-selectednode {
      outline: 2px solid #8cf;
    }

    /* Make sure li selections wrap around markers */

    li.ProseMirror-selectednode {
      outline: none;
    }

    li.ProseMirror-selectednode:after {
      content: '';
      position: absolute;
      left: -32px;
      right: -2px;
      top: -2px;
      bottom: -2px;
      border: 2px solid #8cf;
      pointer-events: none;
    }

    img.ProseMirror-separator {
      display: inline !important;
      border: none !important;
      margin: 0 !important;
    }

    // Gap cursor styles
    // Ref: https://github.com/ProseMirror/prosemirror-gapcursor

    .ProseMirror-gapcursor {
      display: none;
      pointer-events: none;
      position: absolute;
    }

    .ProseMirror-gapcursor:after {
      content: '';
      display: block;
      position: absolute;
      top: -2px;
      width: 20px;
      border-top: 1px solid black;
      animation: ProseMirror-cursor-blink 1.1s steps(2, start) infinite;
    }

    @keyframes ProseMirror-cursor-blink {
      to {
        visibility: hidden;
      }
    }

    &.ProseMirror-focused .ProseMirror-gapcursor {
      display: block;
    }
  `,
};

export const Doc = (props: DocProps) => {
  const { sdk, toolbar, extraChildren } = props;

  const state = React.useMemo(() => {
    return createEditor();
  }, []);

  const editorStyle = cx(
    styles.editor,
    css({
      minHeight: props.minHeight,
      maxHeight: props.maxHeight,
      // Force text direction based on editor locale
      direction: sdk.locales.direction[sdk.field.locale] ?? 'ltr',
    }),
  );

  return (
    <div className={styles.container} data-test-id="rich-text-editor">
      <ProseMirror className={editorStyle} defaultState={state}>
        {!toolbar?.hidden && <Toolbar stickyOffset={props.toolbar?.stickyOffset} />}
        <ProseMirrorDoc />
        {extraChildren}
      </ProseMirror>
    </div>
  );
};
