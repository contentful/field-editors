import React from 'react';
import { css, cx } from 'emotion';
import { Button, Tooltip, Icon } from '@contentful/forma-36-react-components';
import tokens from '@contentful/forma-36-tokens';
import * as Icons from './icons';
import { HeadingSelector } from './HeadingSelector';
import { InsertLinkSelector } from './InsertLinkSelector';

const noop = () => {};

const styles = {
  root: css({
    position: 'relative',
    zIndex: 5,
    border: `1px solid ${tokens.colorElementDark}`,
    backgroundColor: tokens.colorElementLightest,
    padding: tokens.spacingXs,
    borderTopLeftRadius: '2px'
  }),
  actionsRow: css({
    display: 'flex',
    justifyContent: 'space-between'
  }),
  additionalRow: css({
    marginTop: tokens.spacingXs
  }),
  actionsGroup: css({
    display: 'flex'
  }),
  button: css({
    minWidth: '46px'
  }),
  icon: css({
    fill: tokens.colorTextMid,
    verticalAlign: 'middle'
  }),
  zenButton: css({
    marginLeft: tokens.spacingXs
  })
};

function ToolbarButton(props: {
  buttonType?: 'naked' | 'muted';
  disabled?: boolean;
  onClick?: Function;
  testId: string;
  tooltip: string;
  className?: string;
  children: React.ReactNode;
}) {
  const {
    tooltip,
    onClick = noop,
    testId,
    children,
    className,
    buttonType = 'naked',
    disabled = false
  } = props;
  return (
    <Tooltip place="top" content={tooltip}>
      <Button
        className={cx(styles.button, className)}
        disabled={disabled}
        onClick={() => {
          onClick();
        }}
        testId={testId}
        buttonType={buttonType}
        size="small">
        {children}
      </Button>
    </Tooltip>
  );
}

interface MarkdownToolbarProps {
  disabled: boolean;
  actions: {
    simple: {
      bold: Function;
      italic: Function;
      quote: Function;
      ol: Function;
      ul: Function;
      strike: Function;
      code: Function;
    };

    headings: {
      h1: Function;
      h2: Function;
      h3: Function;
    };

    linkExistingMedia: Function;
  };
}

export function MarkdownToolbar(props: MarkdownToolbarProps) {
  const [showAdditional, setShowAdditional] = React.useState(false);
  return (
    <div className={styles.root}>
      <div className={styles.actionsRow}>
        <div className={styles.actionsGroup}>
          <HeadingSelector
            onSelect={heading => {
              if (heading && props.actions.headings[heading]) {
                props.actions.headings[heading]();
              }
            }}>
            <ToolbarButton
              disabled={props.disabled}
              testId="markdown-action-button-heading"
              tooltip="Headings">
              <Icons.Heading label="Headings" className={styles.icon} />
            </ToolbarButton>
          </HeadingSelector>
          <ToolbarButton
            disabled={props.disabled}
            testId="markdown-action-button-bold"
            tooltip="Bold"
            onClick={props.actions.simple.bold}>
            <Icons.Bold label="Bold" className={styles.icon} />
          </ToolbarButton>
          <ToolbarButton
            disabled={props.disabled}
            testId="markdown-action-button-italic"
            tooltip="Italic"
            onClick={props.actions.simple.italic}>
            <Icons.Italic label="Italic" className={styles.icon} />
          </ToolbarButton>
          <ToolbarButton
            disabled={props.disabled}
            testId="markdown-action-button-quote"
            tooltip="Quote"
            onClick={props.actions.simple.quote}>
            <Icons.Quote label="Quote" className={styles.icon} />
          </ToolbarButton>
          <ToolbarButton
            disabled={props.disabled}
            testId="markdown-action-button-ul"
            tooltip="Unordered list"
            onClick={props.actions.simple.ul}>
            <Icons.List label="Unordered list" className={styles.icon} />
          </ToolbarButton>
          <ToolbarButton
            disabled={props.disabled}
            testId="markdown-action-button-ol"
            tooltip="Ordered list"
            onClick={props.actions.simple.ol}>
            <Icons.ListOl label="Ordered list" className={styles.icon} />
          </ToolbarButton>
          <ToolbarButton
            disabled={props.disabled}
            testId="markdown-action-button-link"
            tooltip="Link">
            <Icons.Link label="Link" className={styles.icon} />
          </ToolbarButton>
          <ToolbarButton
            disabled={props.disabled}
            testId="markdown-action-button-toggle-additional"
            tooltip={showAdditional ? 'Hide additional actions' : 'More actions'}
            onClick={() => {
              setShowAdditional(!showAdditional);
            }}>
            <Icon className={styles.icon} icon="MoreHorizontal" />
          </ToolbarButton>
        </div>
        <div className={styles.actionsGroup}>
          <InsertLinkSelector
            disabled={props.disabled}
            onSelectExisting={props.actions.linkExistingMedia}
            onAddNew={() => {}}
            canAddNew
          />
          <ToolbarButton
            disabled={props.disabled}
            testId="markdown-action-button-zen"
            tooltip="Expand"
            buttonType="muted"
            className={styles.zenButton}>
            <Icons.Zen label="Expand" className={styles.icon} />
          </ToolbarButton>
        </div>
      </div>
      {showAdditional && (
        <div className={cx(styles.actionsRow, styles.additionalRow)}>
          <div className={styles.actionsGroup}>
            <ToolbarButton
              disabled={props.disabled}
              testId="markdown-action-button-strike"
              tooltip="Strike out"
              onClick={props.actions.simple.strike}>
              <Icons.Strikethrough label="Strike out" className={styles.icon} />
            </ToolbarButton>
            <ToolbarButton
              disabled={props.disabled}
              testId="markdown-action-button-code"
              tooltip="Code block"
              onClick={props.actions.simple.code}>
              <Icons.Code label="Code block" className={styles.icon} />
            </ToolbarButton>
            <ToolbarButton
              disabled={props.disabled}
              testId="markdown-action-button-hr"
              tooltip="Horizontal rule">
              <Icons.HR label="Horizontal rule" className={styles.icon} />
            </ToolbarButton>
            <ToolbarButton
              disabled={props.disabled}
              testId="markdown-action-button-indent"
              tooltip="Increase indentation">
              <Icons.Indent label="Increase indentation" className={styles.icon} />
            </ToolbarButton>
            <ToolbarButton
              disabled={props.disabled}
              testId="markdown-action-button-dedent"
              tooltip="Decrease indentation">
              <Icons.Dedent label="Decrease indentation" className={styles.icon} />
            </ToolbarButton>
            <ToolbarButton
              disabled={props.disabled}
              testId="markdown-action-button-embed"
              tooltip="Embed external content">
              <Icons.Cubes label="Embed external content" className={styles.icon} />
            </ToolbarButton>
            <ToolbarButton
              disabled={props.disabled}
              testId="markdown-action-button-table"
              tooltip="Insert table">
              <Icons.Table label="Insert table" className={styles.icon} />
            </ToolbarButton>
            <ToolbarButton
              disabled={props.disabled}
              testId="markdown-action-button-special"
              tooltip="Insert special character">
              <Icons.SpecialChar label="Insert special character" className={styles.icon} />
            </ToolbarButton>
            <ToolbarButton
              disabled={props.disabled}
              testId="markdown-action-button-organizeLinks"
              tooltip="Organize links">
              <Icons.OrgLinks label="Organize links" className={styles.icon} />
            </ToolbarButton>
            <ToolbarButton
              disabled={props.disabled}
              testId="markdown-action-button-undo"
              tooltip="Undo">
              <Icons.Undo label="Undo" className={styles.icon} />
            </ToolbarButton>
            <ToolbarButton
              disabled={props.disabled}
              testId="markdown-action-button-redo"
              tooltip="Redo">
              <Icons.Redo label="Redo" className={styles.icon} />
            </ToolbarButton>
          </div>
        </div>
      )}
    </div>
  );
}
