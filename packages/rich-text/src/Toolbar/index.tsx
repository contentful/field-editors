import React from 'react';

import { css } from 'emotion';
import { EditorToolbar, EditorToolbarDivider } from '@contentful/forma-36-react-components';
import { ToolbarHrButton } from '../plugins/Hr';
import { ToolbarHeadingButton } from '../plugins/Heading';
import { ToolbarQuoteButton } from '../plugins/Quote';
import { ToolbarListButton } from '../plugins/List';
import { ToolbarBoldButton } from '../plugins/Bold';
import { ToolbarCodeButton } from '../plugins/Code';
import { ToolbarItalicButton } from '../plugins/Italic';
import { ToolbarUnderlineButton } from '../plugins/Underline';

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
    <EditorToolbar testId="toolbar">
      <div className={styles.formattingOptionsWrapper}>
        <ToolbarHeadingButton isDisabled={isDisabled} />

        <EditorToolbarDivider />

        <ToolbarBoldButton isDisabled={isDisabled} />
        <ToolbarItalicButton isDisabled={isDisabled} />
        <ToolbarUnderlineButton isDisabled={isDisabled} />
        <ToolbarCodeButton isDisabled={isDisabled} />

        <EditorToolbarDivider />

        <ToolbarQuoteButton isDisabled={isDisabled} />
        <ToolbarListButton isDisabled={isDisabled} />
        <ToolbarHrButton isDisabled={isDisabled} />
      </div>
    </EditorToolbar>
  );
};

export default Toolbar;
