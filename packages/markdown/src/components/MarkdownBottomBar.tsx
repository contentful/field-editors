import * as React from 'react';

import { Paragraph, Stack, TextLink } from '@contentful/f36-components';
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

function SanitizeMessage() {
  return (
    <span>
      The output of this markdown editor is sanitized.{' '}
      <TextLink as="a" target="_blank" rel="noopener noreferrer" href={SANITIZE_LINK}>
        Learn more.
      </TextLink>
    </span>
  );
}

function CheatSheetMessage({ onClick }: { onClick: () => void }) {
  return (
    <span>
      Format your text like a pro with the{' '}
      <TextLink as="button" testId="open-markdown-cheatsheet-button" onClick={onClick}>
        markdown cheatsheet
      </TextLink>
      .
    </span>
  );
}

type HelpMode = MarkdownTab | 'zen';

export function MarkdownHelp(props: { onClick: () => void; mode: HelpMode }) {
  let content: JSX.Element | null;

  switch (props.mode) {
    case 'preview':
      content = <SanitizeMessage />;
      break;
    case 'editor':
      content = <CheatSheetMessage onClick={props.onClick} />;
      break;
    case 'zen':
      content = (
        <Stack flexDirection="column" spacing="spacing2Xs" alignItems="flex-start">
          <CheatSheetMessage onClick={props.onClick} />
          <SanitizeMessage />
        </Stack>
      );
      break;
    default:
      content = null;
      throw new Error(`Invalid HelpMode provided in MarkdownHelp: ${props.mode}`);
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
