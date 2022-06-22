import * as React from 'react';
import { Menu } from '@contentful/f36-components';
import * as tokens from '@contentful/f36-tokens';
import { css } from 'emotion';

const styles = {
  container: css({
    position: 'relative',
  }),
  menu: css({
    position: 'absolute',
    width: '100px',
    height: '100px',
    backgroundColor: 'red',
  }),
};

import { RenderLeafProps } from 'slate-react';

export const CommandsPalette = (props: RenderLeafProps) => {
  return (
    <span className={styles.container} data-test-id="1111">
      {props.children}

      <div className={styles.menu}>Hello! It's working</div>
    </span>
  );
};
