import * as React from 'react';
import { RenderLeafProps } from 'slate-react';

import { Bold } from '../Bold';
import { Code } from '../Code';
import { Italic } from '../Italic';
import { Underline } from '../Underline';

export function Leaf(props: RenderLeafProps) {
  const { attributes, leaf } = props;
  let { children } = props;

  if ('bold' in leaf) {
    children = <Bold {...props}>{children}</Bold>;
  }

  if ('code' in leaf) {
    children = <Code {...props}>{children}</Code>;
  }

  if ('italic' in leaf) {
    children = <Italic {...props}>{children}</Italic>;
  }

  if ('underline' in leaf) {
    children = <Underline {...props}>{children}</Underline>;
  }

  return <span {...attributes}>{children}</span>;
}
