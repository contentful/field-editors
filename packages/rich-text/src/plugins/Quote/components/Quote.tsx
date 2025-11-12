import * as React from 'react';

import tokens from '@contentful/f36-tokens';
import { css } from 'emotion';

import { RenderElementProps } from '../../../internal/types';

const style = css({
  margin: '0 0 1.3125rem',
  borderLeft: `6px solid ${tokens.gray200}`,
  paddingLeft: '0.875rem',
  fontStyle: 'normal',
});

export function Quote(props: RenderElementProps) {
  const align = (props.element as any).data?.align as 'left' | 'center' | 'right' | undefined;
  const inlineStyle = align ? { textAlign: align as React.CSSProperties['textAlign'] } : undefined;

  return (
    <blockquote {...props.attributes} className={style} style={inlineStyle}>
      {props.children}
    </blockquote>
  );
}
