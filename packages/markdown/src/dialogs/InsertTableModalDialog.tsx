import React, { useState, useRef, useEffect } from 'react';
import { DialogsAPI } from '@contentful/app-sdk';
import { TextField } from '@contentful/forma-36-react-components';
import inRange from 'lodash/inRange';
import { ModalContent, ModalControls, Button, Form } from '@contentful/f36-components';
import { MarkdownDialogType, MarkdownDialogsParams } from '../types';

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
    <>
      <ModalContent testId="insert-table-modal">
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
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setColumns(Number(e.target.value))
            }
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
      </ModalContent>
      <ModalControls>
        <Button
          testId="insert-table-cancel"
          onClick={() => onClose(false)}
          variant="secondary"
          size="small">
          Cancel
        </Button>
        <Button
          testId="insert-table-confirm"
          onClick={() => onClose({ rows, cols })}
          variant="positive"
          size="small"
          isDisabled={!rowsAreValid || !colsAreValid}>
          Insert
        </Button>
      </ModalControls>
    </>
  );
};

export const openInsertTableDialog = (dialogs: DialogsAPI): Promise<InsertTableModalResult> => {
  return dialogs.openCurrent({
    title: 'Insert table',
    width: 'medium',
    minHeight: '260px',
    shouldCloseOnEscapePress: true,
    shouldCloseOnOverlayClick: true,
    parameters: {
      type: MarkdownDialogType.insertTable,
    } as MarkdownDialogsParams,
  });
};
