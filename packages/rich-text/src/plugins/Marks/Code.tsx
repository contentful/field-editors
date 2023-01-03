import * as React from 'react';

import { CodeIcon } from '@contentful/f36-icons';
import { MARKS } from '@contentful/rich-text-types';
import { createCodePlugin as createDefaultCodePlugin } from '@udecode/plate-basic-marks';
import { css } from 'emotion';

import { PlatePlugin, RenderLeafProps } from '../../internal/types';
import { createMarkToolbarButton } from './components/MarkToolbarButton';
import { buildMarkEventHandler } from './helpers';

export const ToolbarCodeButton = createMarkToolbarButton({
  title: 'Code',
  mark: MARKS.CODE,
  icon: <CodeIcon />,
});

export const ToolbarDropdownCodeButton = createMarkToolbarButton({
  title: 'Code',
  mark: MARKS.CODE,
});

const styles = {
  code: css({
    fontFamily: 'monospace',
    fontSize: '.9em',
  }),
};

export function Code(props: RenderLeafProps) {
  return (
    <code {...props.attributes} className={styles.code}>
      {props.children}
    </code>
  );
}

export const createCodePlugin = (): PlatePlugin =>
  createDefaultCodePlugin({
    type: MARKS.CODE,
    component: Code,
    options: {
      hotkey: ['mod+/'],
    },
    handlers: {
      onKeyDown: buildMarkEventHandler(MARKS.CODE),
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
