import { css } from 'emotion';

export const styles = {
  icon: css({
    marginRight: '10px',
  }),

  root: css({
    margin: '0px 5px',
    fontSize: 'inherit',
    span: {
      webkitUserSelect: 'none',
      mozUserSelect: 'none',
      msUserSelect: 'none',
      userSelect: 'none',
    },
  }),
};
