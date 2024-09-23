import * as React from 'react';

import { SuperscriptIcon } from '@contentful/f36-icons';
import { MARKS } from '@contentful/rich-text-types';
import { createSuperscriptPlugin as createDefaultSuperscriptPlugin } from '@udecode/plate-basic-marks';
import { css } from 'emotion';

import { PlatePlugin, RenderLeafProps } from '../../internal/types';
import { createMarkToolbarButton } from './components/MarkToolbarButton';
import { buildMarkEventHandler } from './helpers';

const styles = {
  superscript: css({
    verticalAlign: 'super',
    fontSize: 'smaller',
  }),
};

export const ToolbarSuperscriptButton = createMarkToolbarButton({
  title: 'Superscript',
  mark: MARKS.SUPERSCRIPT,
  icon: <SuperscriptIcon />,
});

export const ToolbarDropdownSuperscriptButton = createMarkToolbarButton({
  title: 'Superscript',
  mark: MARKS.SUPERSCRIPT,
});

export function Superscript(props: RenderLeafProps) {
  return (
    <sup {...props.attributes} className={styles.superscript}>
      {props.children}
    </sup>
  );
}

export const createSuperscriptPlugin = (): PlatePlugin =>
  createDefaultSuperscriptPlugin({
    type: MARKS.SUPERSCRIPT,
    component: Superscript,
    handlers: {
      onKeyDown: buildMarkEventHandler(MARKS.SUPERSCRIPT),
    },
    deserializeHtml: {
      rules: [
        {
          validNodeName: ['SUP'],
        },
      ],
    },
  });
