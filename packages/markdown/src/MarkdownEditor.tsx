import React from 'react';
import { css } from 'emotion';

import { MarkdownTabs } from './components/MarkdownTabs';
import { MarkdownToolbar } from './components/MarkdownToolbar';
import { MarkdownTextarea } from './components/MarkdownTextarea';
import { MarkdownBottomBar, MarkdownHelp, MarkdownCounter } from './components/MarkdownBottomBar';
import { MarkdownTab } from './types';

const styles = {
  container: css({
    display: 'flex',
    flexDirection: 'column'
  })
};

export function MarkdownEditor() {
  const [selectedTab, setSelectedTab] = React.useState<MarkdownTab>('editor');

  return (
    <div className={styles.container}>
      <MarkdownTabs
        active={selectedTab}
        onSelect={tab => {
          setSelectedTab(tab);
        }}
      />
      <MarkdownToolbar />
      <MarkdownTextarea />
      <MarkdownBottomBar>
        <MarkdownHelp />
        <MarkdownCounter words={0} characters={0} />
      </MarkdownBottomBar>
    </div>
  );
}
