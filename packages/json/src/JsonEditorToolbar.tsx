import * as React from 'react';

import { Button, Flex } from '@contentful/f36-components';
import { ArrowCounterClockwiseIcon, ArrowClockwiseIcon } from '@contentful/f36-icons';
import tokens from '@contentful/f36-tokens';
import { css } from '@emotion/css';

const styles = {
  toolbar: css({
    display: 'flex',
    alignItems: 'center',
    padding: tokens.spacingXs,
    justifyContent: 'space-between',
    backgroundColor: tokens.gray100,
    border: `1px solid ${tokens.gray400}`,
    borderTopLeftRadius: tokens.borderRadiusMedium,
    borderTopRightRadius: tokens.borderRadiusMedium,
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
      <Flex alignItems="center">
        <Button
          variant="transparent"
          startIcon={<ArrowCounterClockwiseIcon size="small" />}
          size="small"
          isDisabled={props.isUndoDisabled}
          testId="json-editor-undo"
          onClick={() => {
            props.onUndo();
          }}
        >
          Undo
        </Button>
        <Button
          variant="transparent"
          size="small"
          startIcon={<ArrowClockwiseIcon size="small" />}
          isDisabled={props.isRedoDisabled}
          testId="json-editor-redo"
          onClick={() => {
            props.onRedo();
          }}
        >
          Redo
        </Button>
      </Flex>
    </div>
  );
}
