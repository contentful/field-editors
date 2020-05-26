import React, { useState, useRef, useEffect } from 'react';
import { css } from 'emotion';
import { DialogsAPI } from 'contentful-ui-extensions-sdk';
import tokens from '@contentful/forma-36-tokens';
import { Modal, TextField, Button, Form } from '@contentful/forma-36-react-components';
import inRange from 'lodash/inRange';
import { MarkdownDialogType, MarkdownDialogsParams } from '../types';

const styles = {
  controlButton: css({
    button: {
      marginRight: tokens.spacingM,
    },
  }),
};

type InsertTableModalPositiveResult = { cols: number; rows: number };
export type InsertTableModalResult = InsertTableModalPositiveResult | false | undefined;

type InsertTableModalProps = {
  onClose: (result: InsertTableModalResult) => void;
};

export const InsertTableModal = ({ onClose }: InsertTableModalProps) => {
  const mainInputRef = useRef<HTMLInputElement>(null);
  const [rows, setRows] = useState(2);
  const [cols, setColumns] = useState(1);
  const rowsAreValid = inRange(rows, 2, 100);
  const colsAreValid = inRange(cols, 1, 100);

  useEffect(() => {
    if (mainInputRef.current?.focus) {
      mainInputRef.current.focus();
    }
  }, [mainInputRef]);

  return (
    <Modal.Content testId="insert-table-modal">
      <Form>
        <TextField
          labelText="Number of rows"
          value={rows.toString()}
          id="insert-table-rows-number-field"
          name="rows"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRows(Number(e.target.value))}
          textInputProps={{
            testId: 'insert-table-rows-number-field',
            min: 2,
            max: 100,
            pattern: '[1-9][0-9]*',
            type: 'number',
            width: 'small',
            autoComplete: 'off',
            inputRef: mainInputRef,
          }}
          validationMessage={!rowsAreValid ? 'Should be between 2 and 100' : ''}
          required
        />
        <TextField
          labelText="Number of columns"
          value={cols.toString()}
          id="insert-table-columns-number-field"
          name="columns"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setColumns(Number(e.target.value))}
          textInputProps={{
            testId: 'insert-table-columns-number-field',
            min: 1,
            max: 100,
            pattern: '[1-9][0-9]*',
            type: 'number',
            width: 'small',
            autoComplete: 'off',
          }}
          validationMessage={!colsAreValid ? 'Should be between 1 and 100' : ''}
          required
        />
      </Form>
      <div className={styles.controlButton}>
        <Button
          testId="insert-table-confirm"
          onClick={() => onClose({ rows, cols })}
          buttonType="positive"
          disabled={!rowsAreValid || !colsAreValid}>
          Insert
        </Button>
        <Button testId="insert-table-cancel" onClick={() => onClose(false)} buttonType="muted">
          Cancel
        </Button>
      </div>
    </Modal.Content>
  );
};

export const openInsertTableDialog = (dialogs: DialogsAPI): Promise<InsertTableModalResult> => {
  return dialogs.openCurrent({
    title: 'Insert table',
    width: 'medium',
    minHeight: '290px',
    shouldCloseOnEscapePress: true,
    shouldCloseOnOverlayClick: true,
    parameters: {
      type: MarkdownDialogType.insertTable,
    } as MarkdownDialogsParams,
  });
};
