import React from 'react';
import { css, cx } from 'emotion';
import { DialogsAPI } from '@contentful/app-sdk';
import { ModalContent } from '@contentful/f36-components';
import tokens from '@contentful/f36-tokens';
import { MarkdownDialogType, MarkdownDialogsParams } from '../types';

import { TextLink, Heading } from '@contentful/f36-components';

const styles = {
  flexColumnContainer: css({
    display: 'flex',
    flexWrap: 'nowrap',
  }),
  flexColumn: css({
    flexGrow: 1,
  }),
  verticalDivider: css({
    borderRight: `1px solid ${tokens.gray500}`,
    paddingRight: tokens.spacing3Xl,
    marginRight: tokens.spacing2Xl,
  }),
  preview: css({
    display: 'inline-block',
    paddingRight: tokens.spacingL,
    width: '50%',
  }),
  unOrderedListPreview: css({
    listStyleType: 'disc',
    marginLeft: tokens.spacingS,
  }),
  orderedListPreview: css({
    listStyleType: 'decimal',
    marginLeft: tokens.spacingS,
  }),
  markup: css({
    display: 'inline-block',
    color: tokens.gray600,
    paddingLeft: tokens.spacingL,
    width: '50%',
  }),
  h1: css({
    fontSize: tokens.fontSize2Xl,
  }),
  h2: css({
    fontSize: tokens.fontSizeXl,
  }),
  h3: css({
    fontSize: tokens.fontSizeL,
  }),
  helpItem: css({
    marginBottom: tokens.spacingS,
    display: 'flex',
    alignItems: 'flex-end',
    height: tokens.spacingXl,
  }),
  helpLink: css({
    margin: 'auto',
  }),
  flexRowContainer: css({
    display: 'flex',
    width: '100%',
    justifyContent: 'center',
    marginTop: tokens.spacingXl,
  }),
};

export const CheatsheetModalDialog = () => {
  return (
    <ModalContent testId="markdown-cheatsheet-dialog-content">
      <div className={styles.flexColumnContainer}>
        <div className={cx(styles.flexColumn, styles.verticalDivider)}>
          <div className={styles.helpItem}>
            <Heading marginBottom="none" as="h1" className={cx(styles.preview, styles.h1)}>
              H1
            </Heading>
            <div className={styles.markup}># heading</div>
          </div>
          <div className={styles.helpItem}>
            <Heading marginBottom="none" as="h2" className={cx(styles.preview, styles.h2)}>
              H2
            </Heading>
            <div className={styles.markup}>## heading</div>
          </div>
          <div className={styles.helpItem}>
            <Heading marginBottom="none" as="h3" className={cx(styles.preview, styles.h3)}>
              H3
            </Heading>
            <div className={styles.markup}>### heading</div>
          </div>
          <div className={styles.helpItem}>
            <strong className={styles.preview}>bold</strong>
            <div className={styles.markup}>__text__</div>
          </div>
          <div className={styles.helpItem}>
            <em className={styles.preview}>italic</em>
            <div className={styles.markup}>*text*</div>
          </div>
          <div className={styles.helpItem}>
            <div className={styles.preview}>strikethrough</div>
            <div className={styles.markup}>~~text~~</div>
          </div>
          <div className={styles.helpItem}>
            <TextLink as="button" className={styles.preview}>
              Link
            </TextLink>
            <div className={styles.markup}>[text](url)</div>
          </div>
        </div>
        <div className={styles.flexColumn}>
          <div className={styles.helpItem}>
            <div className={styles.preview}>Image</div>
            <div className={styles.markup}>![alt-text](url)</div>
          </div>
          <div className={styles.helpItem}>
            <div className={styles.preview}>Unordered list</div>
            <div className={styles.markup}>* list item</div>
          </div>
          <div className={styles.helpItem}>
            <div className={styles.preview}>
              <div>Ordered list</div>
            </div>
            <div className={styles.markup}>1. list item</div>
          </div>
          <div className={styles.helpItem}>
            <div className={styles.preview}>
              <div>Blockquote</div>
            </div>
            <div className={styles.markup}>&gt; quote</div>
          </div>
          <div className={styles.helpItem}>
            <div className={styles.preview}>code span</div>
            <div className={styles.markup}>`code here`</div>
          </div>
          <div className={styles.helpItem}>
            <div className={styles.preview}>code block</div>
            <div className={styles.markup}>```code here```</div>
          </div>
        </div>
      </div>
      <div className={styles.flexRowContainer}>
        <TextLink
          className={styles.helpLink}
          href="https://help.github.com/en/github/writing-on-github/basic-writing-and-formatting-syntax"
          target="_blank"
          rel="noopener noreferrer">
          View the full GitHub-flavored Markdown syntax help (opens in a new window)
        </TextLink>
      </div>
    </ModalContent>
  );
};

export const openCheatsheetModal = (dialogs: DialogsAPI): Promise<void> => {
  return dialogs.openCurrent({
    title: 'Markdown formatting help',
    width: 'large',
    minHeight: '415px',
    shouldCloseOnEscapePress: true,
    shouldCloseOnOverlayClick: true,
    parameters: {
      type: MarkdownDialogType.cheatsheet,
    } as MarkdownDialogsParams,
  });
};
