import React from 'react';

import { Button } from '@contentful/f36-components';
import tokens from '@contentful/f36-tokens';
import { css } from 'emotion';

const styles = {
  toolbar: css({
    display: 'flex',
    alignItems: 'center',
    padding: tokens.spacingXs,
    justifyContent: 'space-between',
    backgroundColor: tokens.gray100,
    border: `1px solid ${tokens.gray200}`,
    borderTopLeftRadius: tokens.borderRadiusSmall,
    borderTopRightRadius: tokens.borderRadiusSmall,
    borderBottom: 'none',
  }),
  title: css({
    fontFamily: tokens.fontStackPrimary,
    fontSize: tokens.fontSizeM,
    color: tokens.gray600,
  }),
  actions: css({
    button: {
      marginLeft: tokens.spacingS,
    },
  }),
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
          variant="secondary"
          size="small"
          isDisabled={props.isUndoDisabled}
          testId="json-editor-undo"
          onClick={() => {
            props.onUndo();
          }}>
          Undo
        </Button>
        <Button
          variant="secondary"
          size="small"
          isDisabled={props.isRedoDisabled}
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
