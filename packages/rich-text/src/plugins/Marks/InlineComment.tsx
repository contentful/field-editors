import React from 'react';

import { css } from 'emotion';
import { RenderLeafProps } from 'slate-react';

const styles = {
  inlineComment: css({
    background: '#C4E7FF',
  }),
};

export const InlineComment = ({ children, attributes }: RenderLeafProps) => {
  return (
    <mark {...attributes} className={styles.inlineComment}>
      {children}
    </mark>
  );
};
