import React from 'react';
import { css, cx } from 'emotion';
import { Button, Tooltip, Icon } from '@contentful/forma-36-react-components';
import tokens from '@contentful/forma-36-tokens';
import * as Icons from './icons';
import { HeadingSelector } from './HeadingSelector';
import { InsertLinkSelector } from './InsertLinkSelector';
import { MarkdownActions } from '../types';

const noop = () => {};

const styles = {
  root: css({
    position: 'relative',
    zIndex: Number(tokens.zIndexWorkbenchHeader),
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
  }),
  tooltip: css({
    zIndex: Number(tokens.zIndexTooltip)
  })
};

function ToolbarButton(props: {
  buttonType?: 'naked' | 'muted';
  disabled?: boolean;
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
    buttonType = 'naked',
    tooltipPlace = 'top',
    disabled = false
  } = props;

  const button = (
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
  );

  if (tooltip) {
    return (
      <Tooltip className={styles.tooltip} place={tooltipPlace} content={tooltip}>
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
        onSelect={heading => {
          if (heading && props.actions.headings[heading]) {
            props.actions.headings[heading]();
          }
        }}>
        <ToolbarButton
          disabled={props.disabled}
          testId="markdown-action-button-heading"
          tooltip="Headings"
          tooltipPlace={tooltipPlace}>
          <Icons.Heading label="Headings" className={styles.icon} />
        </ToolbarButton>
      </HeadingSelector>
      <ToolbarButton
        disabled={props.disabled}
        testId="markdown-action-button-bold"
        tooltip="Bold"
        tooltipPlace={tooltipPlace}
        onClick={props.actions.simple.bold}>
        <Icons.Bold label="Bold" className={styles.icon} />
      </ToolbarButton>
      <ToolbarButton
        disabled={props.disabled}
        testId="markdown-action-button-italic"
        tooltip="Italic"
        tooltipPlace={tooltipPlace}
        onClick={props.actions.simple.italic}>
        <Icons.Italic label="Italic" className={styles.icon} />
      </ToolbarButton>
      <ToolbarButton
        disabled={props.disabled}
        testId="markdown-action-button-quote"
        tooltip="Quote"
        tooltipPlace={tooltipPlace}
        onClick={props.actions.simple.quote}>
        <Icons.Quote label="Quote" className={styles.icon} />
      </ToolbarButton>
      <ToolbarButton
        disabled={props.disabled}
        testId="markdown-action-button-ul"
        tooltip="Unordered list"
        tooltipPlace={tooltipPlace}
        onClick={props.actions.simple.ul}>
        <Icons.List label="Unordered list" className={styles.icon} />
      </ToolbarButton>
      <ToolbarButton
        disabled={props.disabled}
        testId="markdown-action-button-ol"
        tooltip="Ordered list"
        tooltipPlace={tooltipPlace}
        onClick={props.actions.simple.ol}>
        <Icons.ListOl label="Ordered list" className={styles.icon} />
      </ToolbarButton>
      <ToolbarButton
        disabled={props.disabled}
        testId="markdown-action-button-link"
        tooltip="Link"
        tooltipPlace={tooltipPlace}
        onClick={props.actions.insertLink}>
        <Icons.Link label="Link" className={styles.icon} />
      </ToolbarButton>
    </>
  );
}

function AdditionalButtons(props: MarkdownToolbarProps) {
  const tooltipPlace = props.mode === 'zen' ? 'bottom' : 'top';
  return (
    <>
      <ToolbarButton
        disabled={props.disabled}
        testId="markdown-action-button-strike"
        tooltip="Strike out"
        tooltipPlace={tooltipPlace}
        onClick={props.actions.simple.strike}>
        <Icons.Strikethrough label="Strike out" className={styles.icon} />
      </ToolbarButton>
      <ToolbarButton
        disabled={props.disabled}
        testId="markdown-action-button-code"
        tooltip="Code block"
        tooltipPlace={tooltipPlace}
        onClick={props.actions.simple.code}>
        <Icons.Code label="Code block" className={styles.icon} />
      </ToolbarButton>
      <ToolbarButton
        disabled={props.disabled}
        testId="markdown-action-button-hr"
        tooltip="Horizontal rule"
        tooltipPlace={tooltipPlace}
        onClick={props.actions.simple.hr}>
        <Icons.HR label="Horizontal rule" className={styles.icon} />
      </ToolbarButton>
      <ToolbarButton
        disabled={props.disabled}
        testId="markdown-action-button-indent"
        tooltip="Increase indentation"
        tooltipPlace={tooltipPlace}
        onClick={props.actions.simple.indent}>
        <Icons.Indent label="Increase indentation" className={styles.icon} />
      </ToolbarButton>
      <ToolbarButton
        disabled={props.disabled}
        testId="markdown-action-button-dedent"
        tooltip="Decrease indentation"
        tooltipPlace={tooltipPlace}
        onClick={props.actions.simple.dedent}>
        <Icons.Dedent label="Decrease indentation" className={styles.icon} />
      </ToolbarButton>
      <ToolbarButton
        disabled={props.disabled}
        testId="markdown-action-button-embed"
        tooltip="Embed external content"
        tooltipPlace={tooltipPlace}
        onClick={props.actions.embedExternalContent}>
        <Icons.Cubes label="Embed external content" className={styles.icon} />
      </ToolbarButton>
      <ToolbarButton
        disabled={props.disabled}
        testId="markdown-action-button-table"
        tooltip="Insert table"
        tooltipPlace={tooltipPlace}
        onClick={props.actions.insertTable}>
        <Icons.Table label="Insert table" className={styles.icon} />
      </ToolbarButton>
      <ToolbarButton
        disabled={props.disabled}
        testId="markdown-action-button-special"
        tooltip="Insert special character"
        tooltipPlace={tooltipPlace}
        onClick={props.actions.insertSpecialCharacter}>
        <Icons.SpecialChar label="Insert special character" className={styles.icon} />
      </ToolbarButton>
      <ToolbarButton
        disabled={props.disabled}
        testId="markdown-action-button-organizeLinks"
        tooltip="Organize links"
        tooltipPlace={tooltipPlace}
        onClick={props.actions.organizeLinks}>
        <Icons.OrgLinks label="Organize links" className={styles.icon} />
      </ToolbarButton>
      <ToolbarButton
        disabled={props.disabled}
        testId="markdown-action-button-undo"
        tooltip="Undo"
        tooltipPlace={tooltipPlace}
        onClick={props.actions.history.undo}>
        <Icons.Undo label="Undo" className={styles.icon} />
      </ToolbarButton>
      <ToolbarButton
        disabled={props.disabled}
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
      <div className={styles.actionsRow}>
        <div className={styles.actionsGroup}>
          <MainButtons {...props} />
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
            onAddNew={props.actions.addNewMedia}
            canAddNew={props.canUploadAssets}
          />
          <ToolbarButton
            disabled={props.disabled}
            testId="markdown-action-button-zen"
            buttonType="muted"
            onClick={props.actions.openZenMode}
            className={styles.zenButton}>
            <Icons.Zen label="Expand" className={styles.icon} />
          </ToolbarButton>
        </div>
      </div>
      {showAdditional && (
        <div className={cx(styles.actionsRow, styles.additionalRow)}>
          <div className={styles.actionsGroup}>
            <AdditionalButtons {...props} />
          </div>
        </div>
      )}
    </div>
  );
}

export function ZenMarkdownToolbar(props: MarkdownToolbarProps) {
  return (
    <div className={styles.root}>
      <div className={styles.actionsRow}>
        <div className={styles.actionsGroup}>
          <MainButtons {...props} />
          <AdditionalButtons {...props} />
        </div>
        <div className={styles.actionsGroup}>
          <InsertLinkSelector
            disabled={props.disabled}
            onSelectExisting={props.actions.linkExistingMedia}
            onAddNew={props.actions.addNewMedia}
            canAddNew={props.canUploadAssets}
          />
          <Button
            testId="markdown-action-button-zen-close"
            buttonType="positive"
            size="small"
            className={styles.zenButton}
            onClick={() => {
              props.actions.closeZenMode();
            }}>
            Close and save
          </Button>
        </div>
      </div>
    </div>
  );
}

export function MarkdownToolbar(props: MarkdownToolbarProps) {
  if (props.mode === 'zen') {
    return <ZenMarkdownToolbar {...props} />;
  }
  return <DefaultMarkdownToolbar {...props} />;
}
