import * as React from 'react';

import tokens from '@contentful/f36-tokens';
import { BLOCKS } from '@contentful/rich-text-types';
import { css } from 'emotion';

import { RenderElementProps } from '../../internal/types';

const styles = {
  [BLOCKS.PARAGRAPH]: css`
    line-height: ${tokens.lineHeightDefault};
    margin-bottom: 1.5em;
    direction: inherit;
  `,
};

export function Paragraph(props: RenderElementProps) {
  const align = (props.element as any).data?.align as 'left' | 'center' | 'right' | undefined;
  const style = align ? { textAlign: align as React.CSSProperties['textAlign'] } : undefined;

  return (
    <div {...props.attributes} className={styles[BLOCKS.PARAGRAPH]} style={style}>
      {props.children}
    </div>
  );
}
