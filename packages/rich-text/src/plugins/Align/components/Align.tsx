import * as React from 'react';

import { Alignment } from '@udecode/plate-alignment';
// import { css, cx } from 'emotion';
import * as Slate from 'slate-react';

import { ALIGNMENT } from '../types';

const styles = {
  left: {
    display: 'flex',
    justifyContent: 'left',
    backgroundColor: 'teal',
  },
  center: {
    display: 'flex',
    justifyContent: 'center',
    backgroundColor: 'grey',
  },
  right: {
    display: 'flex',
    justifyContent: 'right',
    backgroundColor: 'orange',
  },
};

function createAlign(alignment: Alignment) {
  return function Align(props: Slate.RenderElementProps) {
    return (
      <div {...props.attributes} className={styles[alignment]}>
        {props.children}
      </div>
    );
  };
}

export const AlignLeft = createAlign(ALIGNMENT.LEFT);
export const AlignCenter = createAlign(ALIGNMENT.CENTER);
export const AlignRight = createAlign(ALIGNMENT.RIGHT);
