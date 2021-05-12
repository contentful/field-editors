import React from 'react';

import { css } from 'emotion';
import {
  EditorToolbar,
  EditorToolbarDivider,
  EditorToolbarButton,
} from '@contentful/forma-36-react-components';

type ToolbarProps = {
  isDisabled?: boolean;
};

const styles = {
  embedActionsWrapper: css({
    display: ['-webkit-box', '-ms-flexbox', 'flex'],
    webkitAlignSelf: 'flex-start',
    alignSelf: 'flex-start',
    msFlexItemAlign: 'start',
    marginLeft: 'auto',
  }),
  formattingOptionsWrapper: css({
    display: ['-webkit-box', '-ms-flexbox', 'flex'],
    msFlexAlign: 'center',
    webkitBoxAlign: 'center',
    alignItems: 'center',
    msFlexWrap: 'wrap',
    flexWrap: 'wrap',
    marginRight: '20px',
  }),
};

const Toolbar = ({ isDisabled }: ToolbarProps) => {
  return (
    <EditorToolbar data-test-id="toolbar">
      <div className={styles.formattingOptionsWrapper}>
        <EditorToolbarButton icon="FormatBold" tooltip="Bold" label="Bold" disabled={isDisabled} />
        <EditorToolbarButton
          icon="FormatItalic"
          tooltip="Italic"
          label="Italic"
          disabled={isDisabled}
        />
        <EditorToolbarButton
          icon="FormatUnderlined"
          tooltip="Underline"
          label="Underline"
          disabled={isDisabled}
        />
        <EditorToolbarDivider />
        <EditorToolbarButton icon="HorizontalRule" tooltip="HR" label="HR" disabled={isDisabled} />
      </div>
    </EditorToolbar>
  );
};

export default Toolbar;
