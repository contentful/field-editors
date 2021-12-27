import * as React from 'react';
import { css } from 'emotion';
import tokens from '@contentful/f36-tokens';
import { RenderElementProps } from 'slate-react';
import { BLOCKS } from '@contentful/rich-text-types';

const styles = {
  [BLOCKS.PARAGRAPH]: css`
    line-height: ${tokens.lineHeightDefault};
    margin-bottom: 1.5em;
  `,
};

export function Paragraph(props: RenderElementProps) {
  return (
    <div {...props.attributes} className={styles[BLOCKS.PARAGRAPH]}>
      {props.children}
    </div>
  );
}
