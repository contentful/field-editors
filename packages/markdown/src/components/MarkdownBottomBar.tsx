import * as React from 'react';

import { Paragraph, TextLink } from '@contentful/f36-components';
import tokens from '@contentful/f36-tokens';
import { css } from 'emotion';
import { MarkdownTab } from 'types';

const SANITIZE_LINK = 'https://en.wikipedia.org/wiki/HTML_sanitization';

const styles = {
  root: css({
    display: 'flex',
    justifyContent: 'space-between',
    background: tokens.gray100,
    border: `1px solid ${tokens.gray400}`,
    borderBottomLeftRadius: tokens.borderRadiusSmall,
    borderBottomRightRadius: tokens.borderRadiusSmall,
    padding: `${tokens.spacingXs} ${tokens.spacingS}`,
  }),
  help: css({
    color: tokens.gray700,
    fontSize: tokens.fontSizeS,
    '& button, & a': {
      fontSize: tokens.fontSizeS,
      lineHeight: 'inherit',
    },
  }),
};

export function MarkdownCounter(props: { words: number; characters: number }) {
  return (
    <Paragraph marginBottom="none" className={styles.help}>
      {props.words} {props.words !== 1 ? 'words' : 'word'}, {props.characters}{' '}
      {props.characters !== 1 ? 'characters' : 'character'}
    </Paragraph>
  );
}

export function MarkdownHelp(props: { onClick: () => void; selectedTab?: MarkdownTab }) {
  let content: JSX.Element | null;

  switch (props.selectedTab) {
    case 'preview':
      content = (
        <>
          The output of this markdown editor is sanitized.{' '}
          <TextLink as="a" target="_blank" rel="noopener noreferrer" href={SANITIZE_LINK}>
            Learn more.
          </TextLink>
        </>
      );
      break;
    case 'editor':
      content = (
        <>
          Format your text like a pro with the{' '}
          <TextLink as="button" testId="open-markdown-cheatsheet-button" onClick={props.onClick}>
            markdown cheatsheet
          </TextLink>
          .
        </>
      );
      break;
    default:
      content = null;
  }

  return (
    <Paragraph marginBottom="none" className={styles.help}>
      {content}
    </Paragraph>
  );
}

export function MarkdownBottomBar(props: { children: React.ReactNode }) {
  return <div className={styles.root}>{props.children}</div>;
}
