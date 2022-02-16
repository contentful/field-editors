import * as React from 'react';

import { CodeIcon } from '@contentful/f36-icons';
import { MARKS } from '@contentful/rich-text-types';
import { createCodePlugin as createDefaultCodePlugin } from '@udecode/plate-basic-marks';
import { css } from 'emotion';
import * as Slate from 'slate-react';

import { RichTextPlugin } from '../../types';
import { createMarkToolbarButton } from './components/MarkToolbarButton';

export const ToolbarCodeButton = createMarkToolbarButton({
  title: 'Code',
  mark: MARKS.CODE,
  icon: <CodeIcon />,
});

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

export const createCodePlugin = (tracking: TrackingProvider): RichTextPlugin =>
  createDefaultCodePlugin({
    type: MARKS.CODE,
    component: Code,
    options: {
      hotkey: ['mod+/'],
    },
    handlers: {
      onKeyDown: buildMarkEventHandler(tracking, MARKS.CODE),
    },
    deserializeHtml: {
      rules: [
        {
          validNodeName: ['CODE', 'PRE'],
        },
        {
          validStyle: {
            fontFamily: ['Consolas', 'monospace'],
          },
        },
      ],
    },
  });
