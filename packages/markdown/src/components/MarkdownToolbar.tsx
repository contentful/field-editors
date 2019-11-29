import React from 'react';
import { css } from 'emotion';
import tokens from '@contentful/forma-36-tokens';

const styles = {
  root: css({
    position: 'relative',
    zIndex: 5,
    border: `1px solid ${tokens.colorElementDark}`,
    backgroundColor: tokens.colorElementLightest,
    padding: '9px 7px 7px',
    borderTopLeftRadius: '2px'
  })
};

export function MarkdownToolbar() {
  return <div className={styles.root}>toolbar</div>;
}
