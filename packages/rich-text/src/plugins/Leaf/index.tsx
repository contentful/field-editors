import * as React from 'react';
import { RenderLeafProps } from 'slate-react';
import { Text } from 'slate';

import { Bold } from '../Bold';
import { Code } from '../Code';
import { Italic } from '../Italic';
import { Underline } from '../Underline';

interface Props extends RenderLeafProps {
  leaf: Text & {
    bold?: boolean;
    code?: boolean;
    italic?: boolean;
    underline?: boolean;
  };
}

export function Leaf(props: Props) {
  const { attributes, leaf } = props;
  let { children } = props;

  if (leaf.bold) {
    children = <Bold {...props}>{children}</Bold>;
  }

  if (leaf.code) {
    children = <Code {...props}>{children}</Code>;
  }

  if (leaf.italic) {
    children = <Italic {...props}>{children}</Italic>;
  }

  if (leaf.underline) {
    children = <Underline {...props}>{children}</Underline>;
  }

  return <span {...attributes}>{children}</span>;
}
