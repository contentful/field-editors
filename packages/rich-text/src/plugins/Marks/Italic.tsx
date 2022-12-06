// @ts-nocheck
import * as React from 'react';

import { FormatItalicIcon } from '@contentful/f36-icons';
import { MARKS } from '@contentful/rich-text-types';
import { createItalicPlugin as createDefaultItalicPlugin } from '@udecode/plate-basic-marks';
import { someHtmlElement } from '@udecode/plate-core';
import { css } from 'emotion';
import * as Slate from 'slate-react';

import { RichTextPlugin } from '../../types';
import { createMarkToolbarButton } from './components/MarkToolbarButton';
import { buildMarkEventHandler } from './helpers';

export const ToolbarItalicButton = createMarkToolbarButton({
  title: 'Italic',
  mark: MARKS.ITALIC,
  icon: <FormatItalicIcon />,
});

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

export const createItalicPlugin = (): RichTextPlugin =>
  createDefaultItalicPlugin({
    type: MARKS.ITALIC,
    component: Italic,
    options: {
      hotkey: ['mod+i'],
    },
    handlers: {
      onKeyDown: buildMarkEventHandler(MARKS.ITALIC),
    },
    deserializeHtml: {
      rules: [
        { validNodeName: ['I', 'EM'] },
        {
          validStyle: {
            fontStyle: 'italic',
          },
        },
      ],
      query: (el) => {
        return !someHtmlElement(el, (node) => node.style.fontStyle === 'normal');
      },
    },
  });
