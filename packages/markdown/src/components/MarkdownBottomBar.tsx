import React from 'react';
import { css } from 'emotion';
import tokens from '@contentful/f36-tokens';

import { TextLink, Paragraph } from '@contentful/f36-components';

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
    button: {
      fontSize: tokens.fontSizeS,
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

export function MarkdownHelp(props: { onClick: () => void }) {
  return (
    <Paragraph marginBottom="none" className={styles.help}>
      Format your text like a pro with the{' '}
      <TextLink
        as="button"
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
