import noop from 'lodash/noop';
import React from 'react';
import { css, cx } from 'emotion';
import { Button, Flex, Tooltip } from '@contentful/f36-components';
import { Icon } from '@contentful/forma-36-react-components';
import tokens from '@contentful/forma-36-tokens';
import {
  HeadingIcon,
  FormatBoldIcon,
  FormatItalicIcon,
  QuoteIcon,
  ListBulletedIcon,
  ListNumberedIcon,
  LinkIcon,
  CodeIcon,
  HorizontalRuleIcon,
} from '@contentful/f36-icons';
import * as Icons from './icons';
import { HeadingSelector } from './HeadingSelector';
import { InsertLinkSelector } from './InsertLinkSelector';
import { MarkdownActions } from '../types';

const styles = {
  root: css({
    position: 'relative',
    zIndex: Number(tokens.zIndexWorkbenchHeader),
    border: `1px solid ${tokens.gray400}`,
    backgroundColor: tokens.gray100,
    padding: tokens.spacingXs,
    borderTopLeftRadius: tokens.borderRadiusSmall,
  }),
  button: css({
    height: '30px',
    width: '36px',
    marginLeft: tokens.spacing2Xs,
    marginRight: tokens.spacing2Xs,
  }),
  icon: css({
    fill: tokens.gray700,
    verticalAlign: 'middle',
  }),
  zenButton: css({
    marginLeft: tokens.spacingXs,
  }),
  zenButtonPressed: css({
    backgroundColor: tokens.gray400,
  }),
  tooltip: css({
    zIndex: Number(tokens.zIndexTooltip),
  }),
};

function ToolbarButton(props: {
  variant?: 'transparent' | 'secondary';
  isDisabled?: boolean;
  onClick?: Function;
  testId: string;
  tooltipPlace?: 'top' | 'bottom';
  tooltip?: string;
  className?: string;
  children: React.ReactNode;
}) {
  const {
    tooltip,
    onClick = noop,
    testId,
    children,
    className,
    variant = 'transparent',
    tooltipPlace = 'top',
    isDisabled = false,
  } = props;

  const button = (
    <Button
      className={cx(styles.button, className)}
      isDisabled={isDisabled}
      onClick={() => {
        onClick();
      }}
      testId={testId}
      variant={variant}
      size="small">
      {children}
    </Button>
  );

  if (tooltip) {
    return (
      <Tooltip className={styles.tooltip} placement={tooltipPlace} content={tooltip}>
        {button}
      </Tooltip>
    );
  }

  return button;
}

interface MarkdownToolbarProps {
  canUploadAssets: boolean;
  disabled: boolean;
  actions: MarkdownActions;
  mode: 'default' | 'zen';
}

function MainButtons(props: MarkdownToolbarProps) {
  const tooltipPlace = props.mode === 'zen' ? 'bottom' : 'top';

  return (
    <>
      <HeadingSelector
        onSelect={(heading) => {
          if (heading && props.actions.headings[heading]) {
            props.actions.headings[heading]();
          }
        }}>
        <ToolbarButton
          isDisabled={props.disabled}
          testId="markdown-action-button-heading"
          tooltip="Headings"
          tooltipPlace={tooltipPlace}>
          <HeadingIcon aria-label="Headings" className={styles.icon} />
        </ToolbarButton>
      </HeadingSelector>
      <ToolbarButton
        isDisabled={props.disabled}
        testId="markdown-action-button-bold"
        tooltip="Bold"
        tooltipPlace={tooltipPlace}
        onClick={props.actions.simple.bold}>
        <FormatBoldIcon aria-label="Bold" className={styles.icon} />
      </ToolbarButton>
      <ToolbarButton
        isDisabled={props.disabled}
        testId="markdown-action-button-italic"
        tooltip="Italic"
        tooltipPlace={tooltipPlace}
        onClick={props.actions.simple.italic}>
        <FormatItalicIcon aria-label="Italic" className={styles.icon} />
      </ToolbarButton>
      <ToolbarButton
        isDisabled={props.disabled}
        testId="markdown-action-button-quote"
        tooltip="Quote"
        tooltipPlace={tooltipPlace}
        onClick={props.actions.simple.quote}>
        <QuoteIcon aria-label="Quote" className={styles.icon} />
      </ToolbarButton>
      <ToolbarButton
        isDisabled={props.disabled}
        testId="markdown-action-button-ul"
        tooltip="Unordered list"
        tooltipPlace={tooltipPlace}
        onClick={props.actions.simple.ul}>
        <ListBulletedIcon aria-label="Unordered list" className={styles.icon} />
      </ToolbarButton>
      <ToolbarButton
        isDisabled={props.disabled}
        testId="markdown-action-button-ol"
        tooltip="Ordered list"
        tooltipPlace={tooltipPlace}
        onClick={props.actions.simple.ol}>
        <ListNumberedIcon aria-label="Ordered list" className={styles.icon} />
      </ToolbarButton>
      <ToolbarButton
        isDisabled={props.disabled}
        testId="markdown-action-button-link"
        tooltip="Link"
        tooltipPlace={tooltipPlace}
        onClick={props.actions.insertLink}>
        <LinkIcon aria-label="Link" className={styles.icon} />
      </ToolbarButton>
    </>
  );
}

function AdditionalButtons(props: MarkdownToolbarProps) {
  const tooltipPlace = props.mode === 'zen' ? 'bottom' : 'top';
  return (
    <>
      <ToolbarButton
        isDisabled={props.disabled}
        testId="markdown-action-button-strike"
        tooltip="Strike out"
        tooltipPlace={tooltipPlace}
        onClick={props.actions.simple.strike}>
        <Icons.Strikethrough label="Strike out" className={styles.icon} />
      </ToolbarButton>
      <ToolbarButton
        isDisabled={props.disabled}
        testId="markdown-action-button-code"
        tooltip="Code block"
        tooltipPlace={tooltipPlace}
        onClick={props.actions.simple.code}>
        <CodeIcon aria-label="Code block" className={styles.icon} />
      </ToolbarButton>
      <ToolbarButton
        isDisabled={props.disabled}
        testId="markdown-action-button-hr"
        tooltip="Horizontal rule"
        tooltipPlace={tooltipPlace}
        onClick={props.actions.simple.hr}>
        <HorizontalRuleIcon aria-label="Horizontal rule" className={styles.icon} />
      </ToolbarButton>
      <ToolbarButton
        isDisabled={props.disabled}
        testId="markdown-action-button-indent"
        tooltip="Increase indentation"
        tooltipPlace={tooltipPlace}
        onClick={props.actions.simple.indent}>
        <Icons.Indent label="Increase indentation" className={styles.icon} />
      </ToolbarButton>
      <ToolbarButton
        isDisabled={props.disabled}
        testId="markdown-action-button-dedent"
        tooltip="Decrease indentation"
        tooltipPlace={tooltipPlace}
        onClick={props.actions.simple.dedent}>
        <Icons.Dedent label="Decrease indentation" className={styles.icon} />
      </ToolbarButton>
      <ToolbarButton
        isDisabled={props.disabled}
        testId="markdown-action-button-embed"
        tooltip="Embed external content"
        tooltipPlace={tooltipPlace}
        onClick={props.actions.embedExternalContent}>
        <Icons.Cubes label="Embed external content" className={styles.icon} />
      </ToolbarButton>
      <ToolbarButton
        isDisabled={props.disabled}
        testId="markdown-action-button-table"
        tooltip="Insert table"
        tooltipPlace={tooltipPlace}
        onClick={props.actions.insertTable}>
        <Icons.Table label="Insert table" className={styles.icon} />
      </ToolbarButton>
      <ToolbarButton
        isDisabled={props.disabled}
        testId="markdown-action-button-special"
        tooltip="Insert special character"
        tooltipPlace={tooltipPlace}
        onClick={props.actions.insertSpecialCharacter}>
        <Icons.SpecialChar label="Insert special character" className={styles.icon} />
      </ToolbarButton>
      <ToolbarButton
        isDisabled={props.disabled}
        testId="markdown-action-button-organizeLinks"
        tooltip="Organize links"
        tooltipPlace={tooltipPlace}
        onClick={props.actions.organizeLinks}>
        <Icons.OrgLinks label="Organize links" className={styles.icon} />
      </ToolbarButton>
      <ToolbarButton
        isDisabled={props.disabled}
        testId="markdown-action-button-undo"
        tooltip="Undo"
        tooltipPlace={tooltipPlace}
        onClick={props.actions.history.undo}>
        <Icons.Undo label="Undo" className={styles.icon} />
      </ToolbarButton>
      <ToolbarButton
        isDisabled={props.disabled}
        testId="markdown-action-button-redo"
        tooltip="Redo"
        tooltipPlace={tooltipPlace}
        onClick={props.actions.history.redo}>
        <Icons.Redo label="Redo" className={styles.icon} />
      </ToolbarButton>
    </>
  );
}

export function DefaultMarkdownToolbar(props: MarkdownToolbarProps) {
  const [showAdditional, setShowAdditional] = React.useState(false);

  return (
    <div className={styles.root}>
      <Flex justifyContent="space-between">
        <Flex>
          <MainButtons {...props} />
          <ToolbarButton
            isDisabled={props.disabled}
            testId="markdown-action-button-toggle-additional"
            tooltip={showAdditional ? 'Hide additional actions' : 'More actions'}
            onClick={() => {
              setShowAdditional(!showAdditional);
            }}>
            <Icon className={styles.icon} icon="MoreHorizontal" />
          </ToolbarButton>
        </Flex>
        <Flex>
          <InsertLinkSelector
            disabled={props.disabled}
            onSelectExisting={props.actions.linkExistingMedia}
            onAddNew={props.actions.addNewMedia}
            canAddNew={props.canUploadAssets}
          />
          <ToolbarButton
            isDisabled={props.disabled}
            testId="markdown-action-button-zen"
            variant="secondary"
            onClick={props.actions.openZenMode}
            className={styles.zenButton}>
            <Icons.Zen label="Expand" className={styles.icon} />
          </ToolbarButton>
        </Flex>
      </Flex>
      {showAdditional && (
        <Flex justifyContent="space-between" marginTop="spacingXs">
          <Flex>
            <AdditionalButtons {...props} />
          </Flex>
        </Flex>
      )}
    </div>
  );
}

export function ZenMarkdownToolbar(props: MarkdownToolbarProps) {
  return (
    <div className={styles.root}>
      <Flex justifyContent="space-between">
        <Flex>
          <MainButtons {...props} />
          <AdditionalButtons {...props} />
        </Flex>
        <Flex>
          <InsertLinkSelector
            disabled={props.disabled}
            onSelectExisting={props.actions.linkExistingMedia}
            onAddNew={props.actions.addNewMedia}
            canAddNew={props.canUploadAssets}
          />
          <Button
            testId="markdown-action-button-zen-close"
            variant="secondary"
            size="small"
            className={cx(styles.zenButton, styles.zenButtonPressed)}
            onClick={() => {
              props.actions.closeZenMode();
            }}>
            <Icons.Zen label="Collapse" className={styles.icon} />
          </Button>
        </Flex>
      </Flex>
    </div>
  );
}

export const MarkdownToolbar = React.memo((props: MarkdownToolbarProps) => {
  if (props.mode === 'zen') {
    return <ZenMarkdownToolbar {...props} />;
  }
  return <DefaultMarkdownToolbar {...props} />;
});

MarkdownToolbar.displayName = 'MarkdownToolbar';
