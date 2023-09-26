import * as React from 'react';

import tokens from '@contentful/f36-tokens';
import { css } from 'emotion';

import { PlateEditor, RenderLeafProps } from '../../../internal/types';
import { trimLeadingSlash } from '../utils/trimLeadingSlash';
import { CommandList } from './CommandList';

const styles = {
  commandPrompt: css({
    color: tokens.blue400,
  }),
};

export const CommandPrompt = (props: RenderLeafProps & { editor: PlateEditor }) => {
  const query = React.useMemo(() => trimLeadingSlash(props.text.text), [props.text.text]);
  const editor = props.editor;
  const [textElement, setTextElement] = React.useState<HTMLSpanElement>();

  return (
    <span
      className={styles.commandPrompt}
      ref={(e) => {
        setTextElement(e as HTMLSpanElement);
      }}
      {...props.attributes}
    >
      {props.children}
      <CommandList query={query} editor={editor} textContainer={textElement} />
    </span>
  );
};
