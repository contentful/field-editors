import * as React from 'react';

import { SuperscriptIcon } from '@contentful/f36-icons';
import { MARKS } from '@contentful/rich-text-types';
import { createSuperscriptPlugin as createDefaultSuperscriptPlugin } from '@udecode/plate-basic-marks';
import * as Slate from 'slate-react';

import { RichTextPlugin } from '../../types';
import { createMarkToolbarButton } from './components/MarkToolbarButton';
import { buildMarkEventHandler } from './helpers';

export const ToolbarSuperscriptButton = createMarkToolbarButton({
  title: 'Superscript',
  mark: MARKS.SUPERSCRIPT,
  icon: <SuperscriptIcon />,
});

export function Superscript(props: Slate.RenderLeafProps) {
  return <sup {...props.attributes}>{props.children}</sup>;
}

export const createSuperscriptPlugin = (): RichTextPlugin =>
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
