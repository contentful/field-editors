import React from 'react';
import { css } from 'emotion';
import { Paragraph, TextLink } from '@contentful/forma-36-react-components';
import tokens from '@contentful/forma-36-tokens';

const styles = {
  root: css({
    display: 'flex',
    justifyContent: 'space-between',
    background: tokens.colorElementLightest,
    border: `1px solid ${tokens.colorElementDark}`,
    borderBottomLeftRadius: '2px',
    borderBottomRightRadius: '2px',
    padding: `${tokens.spacingXs} ${tokens.spacingS}`,
  }),
  help: css({
    color: tokens.colorTextMid,
    fontSize: tokens.fontSizeS,
    button: {
      fontSize: tokens.fontSizeS,
    },
  }),
};

export function MarkdownCounter(props: { words: number; characters: number }) {
  return (
    <Paragraph className={styles.help}>
      {props.words} {props.words !== 1 ? 'words' : 'word'}, {props.characters}{' '}
      {props.characters !== 1 ? 'characters' : 'character'}
    </Paragraph>
  );
}

export function MarkdownHelp(props: { onClick: () => void }) {
  return (
    <Paragraph className={styles.help}>
      Format your text like a pro with the{' '}
      <TextLink
        testId="open-markdown-cheatsheet-button"
        onClick={() => {
          props.onClick();
        }}>
        markdown cheatsheet
      </TextLink>
      .
    </Paragraph>
  );
}

export function MarkdownBottomBar(props: { children: React.ReactNode }) {
  return <div className={styles.root}>{props.children}</div>;
}
