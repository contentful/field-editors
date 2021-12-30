import React from 'react';
import { css, cx } from 'emotion';
import tokens from '@contentful/f36-tokens';
import { MarkdownTab } from '../types';

const styles = {
  root: css({
    display: 'flex',
    zIndex: 10,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    overflow: 'hidden',
    marginBottom: '-1px',
    fontSize: tokens.fontSizeM,
  }),
  tab: css({
    cursor: 'pointer',
    color: tokens.gray700,
    padding: tokens.spacingXs,
    minWidth: '70px',
    border: `1px solid ${tokens.gray400}`,
    borderTopLeftRadius: tokens.borderRadiusSmall,
    borderTopRightRadius: tokens.borderRadiusSmall,
    marginLeft: tokens.spacingXs,
    textAlign: 'center',
    backgroundColor: tokens.gray100,
    borderBottomColor: tokens.gray100,
    outline: 'none',
    '&:focus': {
      boxShadow: tokens.boxShadowHeavy,
    },
    transition: `all ${tokens.transitionEasingDefault} ${tokens.transitionDurationShort}`,
  }),
  inactiveTab: css({
    background: tokens.gray200,
    borderBottomColor: tokens.gray400,
    '&:hover': {
      background: tokens.gray300,
    },
  }),
};

interface MarkdownTabsProps {
  active: MarkdownTab;
  onSelect: (selected: MarkdownTab) => void;
}

function MarkdownTabItem(props: {
  isActive: boolean;
  name: MarkdownTab;
  testId: string;
  onSelect: (name: MarkdownTab) => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cx(styles.tab, {
        [styles.inactiveTab]: props.isActive === false,
      })}
      onClick={() => {
        props.onSelect(props.name);
      }}
      onKeyDown={(e) => {
        if (e.keyCode === 13) {
          props.onSelect(props.name);
        }
      }}
      tabIndex={0}
      role="tab"
      aria-controls={props.name}
      aria-selected={props.isActive === true}
      data-test-id={props.testId}>
      {props.children}
    </div>
  );
}

export function MarkdownTabs(props: MarkdownTabsProps) {
  return (
    <div className={styles.root}>
      <MarkdownTabItem
        name="editor"
        onSelect={props.onSelect}
        isActive={props.active === 'editor'}
        testId="markdown-tab-md">
        Editor
      </MarkdownTabItem>
      <MarkdownTabItem
        name="preview"
        onSelect={props.onSelect}
        isActive={props.active === 'preview'}
        testId="markdown-tab-preview">
        Preview
      </MarkdownTabItem>
    </div>
  );
}
