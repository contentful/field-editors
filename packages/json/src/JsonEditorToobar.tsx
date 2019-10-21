import React from 'react';
import { css } from 'emotion';
import tokens from '@contentful/forma-36-tokens';
import { Button } from '@contentful/forma-36-react-components';

const styles = {
  toolbar: css({
    display: 'flex',
    alignItems: 'center',
    padding: tokens.spacingXs,
    justifyContent: 'space-between',
    backgroundColor: tokens.colorElementLightest,
    border: `1px solid ${tokens.colorElementLight}`,
    borderBottom: 'none'
  }),
  title: css({
    fontFamily: tokens.fontStackPrimary,
    fontSize: tokens.fontSizeM,
    color: tokens.colorTextLight
  }),
  actions: css({
    button: {
      marginLeft: tokens.spacingS
    }
  })
};

type JsonEditorToolbarProps = {
  isUndoDisabled: boolean;
  isRedoDisabled: boolean;
  onRedo: () => void;
  onUndo: () => void;
};

export function JsonEditorToolbar(props: JsonEditorToolbarProps) {
  return (
    <div className={styles.toolbar}>
      <div className={styles.title}>JSON Editor</div>
      <div className={styles.actions}>
        <Button
          buttonType="muted"
          size="small"
          disabled={props.isUndoDisabled}
          testId="json-editor-undo"
          onClick={() => {
            props.onUndo();
          }}>
          Undo
        </Button>
        <Button
          buttonType="muted"
          size="small"
          disabled={props.isRedoDisabled}
          testId="json-editor-redo"
          onClick={() => {
            props.onRedo();
          }}>
          Redo
        </Button>
      </div>
    </div>
  );
}
