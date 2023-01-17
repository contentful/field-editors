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
      // We need to define multiple hotkeys here,
      // - mod+/ -> QWERTY keyboard layout
      // - mod+shift+7 -> QWERTZ keyboard layout
      // The workaround like in packages/rich-text/src/plugins/CommandPalette/onKeyDown.ts is sadly not working here,
      // as `shift+7` is not interpreted as `/` with the `mod` key by the OS.
      // TODO: there are a lot more different keyboard layouts out there
      hotkey: ['mod+/', 'mod+shift+7'],
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
