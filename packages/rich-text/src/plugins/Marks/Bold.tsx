import * as React from 'react';

import { FormatBoldIcon } from '@contentful/f36-icons';
import { MARKS } from '@contentful/rich-text-types';
import { createBoldPlugin as createDefaultBoldPlugin } from '@udecode/plate-basic-marks';
import { someHtmlElement } from '@udecode/plate-core';
import { css } from 'emotion';
import * as Slate from 'slate-react';

import { RichTextPlugin } from '../../types';
import { createMarkToolbarButton } from './components/MarkToolbarButton';
import { buildMarkEventHandler } from './helpers';

export const ToolbarBoldButton = createMarkToolbarButton({
  title: 'Bold',
  mark: MARKS.BOLD,
  icon: <FormatBoldIcon />,
});

const styles = {
  bold: css({
    fontWeight: 600,
  }),
};

export function Bold(props: Slate.RenderLeafProps) {
  return (
    <strong {...props.attributes} className={styles.bold}>
      {props.children}
    </strong>
  );
}

const isGoogleBoldWrapper = (el: HTMLElement) =>
  el.id.startsWith('docs-internal-guid') && el.nodeName === 'B';

export const createBoldPlugin = (): RichTextPlugin =>
  // TODO check this

  // @ts-ignore
  createDefaultBoldPlugin({
    type: MARKS.BOLD,
    component: Bold,
    options: {
      hotkey: ['mod+b'],
    },
    handlers: {
      // TODO check this

      // @ts-ignore
      onKeyDown: buildMarkEventHandler(MARKS.BOLD),
    },
    deserializeHtml: {
      rules: [
        { validNodeName: ['STRONG', 'B'] },
        {
          validStyle: {
            fontWeight: ['600', '700', 'bold'],
          },
        },
      ],
      query: (el) => {
        return (
          !isGoogleBoldWrapper(el) &&
          !someHtmlElement(el, (node) => node.style.fontWeight === 'normal')
        );
      },
    },
  });
