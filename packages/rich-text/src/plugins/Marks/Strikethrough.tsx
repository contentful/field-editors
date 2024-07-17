import * as React from 'react';

import { MARKS } from '@contentful/rich-text-types';
import { createStrikethroughPlugin as createDefaultStrikethroughPlugin } from '@udecode/plate-basic-marks';
import { css } from 'emotion';

import { PlatePlugin, RenderLeafProps } from '../../internal/types';
import { createMarkToolbarButton } from './components/MarkToolbarButton';
import { buildMarkEventHandler } from './helpers';

const styles = {
  strikethrough: css({
    textDecoration: 'line-through',
  }),
};

export const ToolbarDropdownStrikethroughButton = createMarkToolbarButton({
  title: 'Strikethrough',
  mark: MARKS.STRIKETHROUGH,
});

export const ToolbarStrikethroughButton = createMarkToolbarButton({
  title: 'Strikethrough',
  mark: MARKS.STRIKETHROUGH,
  //@TODO - strikethrough icon should be part of f36-icons
  icon: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="18" height="18">
      <rect width="256" height="256" fill="none" />
      <line
        x1="40"
        y1="128"
        x2="216"
        y2="128"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="24"
      />
      <path
        d="M72,168c0,22.09,25.07,40,56,40s56-17.91,56-40c0-23.77-21.62-33-45.6-40"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="24"
      />
      <path
        d="M75.11,88c0-22.09,22-40,52.89-40,23,0,40.24,9.87,48,24"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="24"
      />
    </svg>
  ),
});

export function Strikethrough(props: RenderLeafProps) {
  return (
    <s {...props.attributes} className={styles.strikethrough}>
      {props.children}
    </s>
  );
}

export const createStrikethroughPlugin = (): PlatePlugin =>
  createDefaultStrikethroughPlugin({
    type: MARKS.STRIKETHROUGH,
    component: Strikethrough,
    handlers: {
      onKeyDown: buildMarkEventHandler(MARKS.STRIKETHROUGH),
    },
    deserializeHtml: {
      rules: [
        {
          validNodeName: ['S'],
        },
      ],
    },
  });
