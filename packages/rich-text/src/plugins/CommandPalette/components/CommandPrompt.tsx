import * as React from 'react';

import { PlateRenderLeafProps } from '@udecode/plate-core';

import { trimLeadingSlash } from '../utils/trimLeadingSlash';
import { CommandList } from './CommandList';

export const CommandPrompt = (props: PlateRenderLeafProps) => {
  const query = trimLeadingSlash(props.text.text);

  return (
    <span {...props.attributes}>
      {props.children}
      <CommandList query={query} editor={props.editor} />
    </span>
  );
};
