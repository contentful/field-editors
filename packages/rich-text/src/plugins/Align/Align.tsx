import React from 'react';

import { createAlignPlugin as createDefaultAlignPlugin } from '@udecode/plate-alignment';
import Slate from 'slate-react';

import { RichTextPlugin } from '../../types';

export function AlignContainer(props: Slate.RenderLeafProps) {
  return <sub {...props.attributes}>{props.children}</sub>;
}

export const createAlignPlugin = (): RichTextPlugin =>
  createDefaultAlignPlugin({ component: AlignContainer });
