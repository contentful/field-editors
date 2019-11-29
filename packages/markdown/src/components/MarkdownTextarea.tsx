import React from 'react';
import { css } from 'emotion';
import tokens from '@contentful/forma-36-tokens';

const styles = {
  root: css({
    border: `1px solid ${tokens.colorElementDark}`,
    borderWidth: '0 1px',
    overflowY: 'auto',
    height: 'auto'
  })
};

export function MarkdownTextarea() {
  return <div className={styles.root} style={{ height: 300 }} />;
}
