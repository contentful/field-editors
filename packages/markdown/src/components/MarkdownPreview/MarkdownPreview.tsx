import React from 'react';
import tokens from '@contentful/forma-36-tokens';
import { css } from 'emotion';

const styles = {
  root: css`
    border: 1px solid ${tokens.colorElementDark};
    border-width: 0 1px;
    overflow-y: 'auto';
    height: 'auto';
    min-height: 300px;
  `
};

export const MarkdownPreview = () => {
  return (
    <div className={styles.root} data-test-id="markdown-preview">
      preview
    </div>
  );
};
