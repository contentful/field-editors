import * as React from 'react';

import { PlateRenderLeafProps } from '@udecode/plate-core';
import { RichTextEditor } from 'types';

import { trimLeadingSlash } from '../utils/trimLeadingSlash';
import { CommandList } from './CommandList';

export const CommandPrompt = (props: PlateRenderLeafProps) => {
  const query = React.useMemo(() => trimLeadingSlash(props.text.text), [props.text.text]);
  const editor = props.editor as RichTextEditor;
  const [textElement, setTextElement] = React.useState<HTMLSpanElement>();

  return (
    <span
      ref={(e) => {
        setTextElement(e as HTMLSpanElement);
      }}
      {...props.attributes}>
      {props.children}
      <CommandList query={query} editor={editor} textContainer={textElement} />
    </span>
  );
};
