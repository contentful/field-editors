import { createAlignPlugin as defaultCreateAlignPlugin, KEY_ALIGN } from '@udecode/plate-alignment';
import { AlignLeft, AlignCenter, AlignRight } from './components/Align';
import { RichTextEditor, RichTextPlugin } from '../../types';
import { ALIGNMENT } from './types';

export const createAlignPlugin = (): RichTextPlugin =>
  defaultCreateAlignPlugin<RichTextEditor>({
    overrideByKey: {
      [ALIGNMENT.LEFT]: {
        type: ALIGNMENT.LEFT,
        component: AlignLeft,
      },
      [ALIGNMENT.CENTER]: {
        type: ALIGNMENT.CENTER,
        component: AlignCenter,
      },
      [ALIGNMENT.RIGHT]: {
        type: ALIGNMENT.RIGHT,
        component: AlignRight,
      },
    },
    deserializeHtml: {
      rules: [
        { validNodeName: ['div'] },
        {
          validStyle: {
            display: 'flex',
            justifyContent: ['left', 'center', 'right'],
          },
        },
      ],
    },
  });
