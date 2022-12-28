import * as React from 'react';

import tokens from '@contentful/f36-tokens';
import { BLOCKS } from '@contentful/rich-text-types';
import { PlateRenderElementProps } from '@udecode/plate-core';
import { css } from 'emotion';

const styles = {
  [BLOCKS.PARAGRAPH]: css`
    line-height: ${tokens.lineHeightDefault};
    margin-bottom: 1.5em;
  `,
};

export function Paragraph(props: PlateRenderElementProps) {
  return (
    <div {...props.attributes} style={props.style} className={styles[BLOCKS.PARAGRAPH]}>
      {props.children}
    </div>
  );
}
