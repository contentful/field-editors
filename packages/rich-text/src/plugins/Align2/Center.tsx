import * as React from 'react';
import { createAlignToolbarButton } from './components/CreateAlignToolbarButton';
// import { Alignment } from '@udecode/plate-alignment';
import { AiOutlineAlignCenter } from 'react-icons/ai';
import ALIGNMENT from './types';
import { css } from 'emotion';
import Slate from 'slate-react';
import { RichTextPlugin } from 'types';
import { createAlignPlugin } from '@udecode/plate-alignment';

export const ToolbarCenterButton = createAlignToolbarButton({
  title: 'Center',
  align: ALIGNMENT.CENTER,
  icon: <AiOutlineAlignCenter size={17} />,
});

const styles = {
  center: css({
    display: 'flex',
    justifyContent: 'center',
  }),
};

export function Center(props: Slate.RenderLeafProps) {
  return (
    <div {...props.attributes} className={styles.center}>
      {props.children}
    </div>
  );
}

export const createCenterPlugin = (): RichTextPlugin =>
  createAlignPlugin({
    type: ALIGNMENT.CENTER,
    key: ALIGNMENT.CENTER,
    component: Center,
    deserializeHtml: {
      rules: [
        { validNodeName: ['DIV'] },
        {
          validStyle: {
            display: ['flex'],
            justifyContent: ['center'],
          },
        },
      ],
    },
  }) as RichTextPlugin;
