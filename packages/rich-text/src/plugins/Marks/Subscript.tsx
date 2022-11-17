import * as React from 'react';

import { SubscriptIcon } from '@contentful/f36-icons';
import { MARKS } from '@contentful/rich-text-types';
import { createSubscriptPlugin as createDefaultSubscriptPlugin } from '@udecode/plate-basic-marks';
import { css } from 'emotion';
import * as Slate from 'slate-react';

import { RichTextPlugin } from '../../types';
import { createMarkToolbarButton } from './components/MarkToolbarButton';
import { buildMarkEventHandler } from './helpers';

const styles = {
  subscript: css({
    verticalAlign: 'sub',
    fontSize: 'smaller',
  }),
};

export const ToolbarSubscriptButton = createMarkToolbarButton({
  title: 'Subscript',
  mark: MARKS.SUBSCRIPT,
  icon: <SubscriptIcon viewBox="0 0 23 18" />,
});

export function Subscript(props: Slate.RenderLeafProps) {
  return (
    <sub {...props.attributes} className={styles.subscript}>
      {props.children}
    </sub>
  );
}

export const createSubscriptPlugin = (): RichTextPlugin =>
  createDefaultSubscriptPlugin({
    type: MARKS.SUBSCRIPT,
    component: Subscript,
    handlers: {
      onKeyDown: buildMarkEventHandler(MARKS.SUBSCRIPT),
    },
    deserializeHtml: {
      rules: [
        {
          validNodeName: ['SUB'],
        },
      ],
    },
  });
