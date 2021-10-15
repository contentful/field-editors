import React, { useState, useRef, useEffect } from 'react';
import { DialogsAPI } from '@contentful/app-sdk';
import inRange from 'lodash/inRange';
import {
  ModalContent,
  ModalControls,
  Button,
  Form,
  FormControl,
  TextInput,
} from '@contentful/f36-components';
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
          <FormControl id="insert-table-rows-number-field" isRequired isInvalid={!rowsAreValid}>
            <FormControl.Label>Number of rows</FormControl.Label>
            <TextInput
              name="rows"
              value={rows.toString()}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRows(Number(e.target.value))}
              testId="insert-table-rows-number-field"
              min={2}
              max={100}
              pattern="[1-9][0-9]*"
              type="number"
              width="small"
              autoComplete="off"
              ref={mainInputRef}
            />
            {!rowsAreValid && (
              <FormControl.ValidationMessage>
                Should be between 2 and 100
              </FormControl.ValidationMessage>
            )}
          </FormControl>

          <FormControl id="insert-table-columns-number-field" isRequired isInvalid={!colsAreValid}>
            <FormControl.Label>Number of columns</FormControl.Label>
            <TextInput
              name="columns"
              value={cols.toString()}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setColumns(Number(e.target.value))
              }
              testId="insert-table-columns-number-field"
              min={1}
              max={100}
              pattern="[1-9][0-9]*"
              type="number"
              width="small"
              autoComplete="off"
            />
            {!colsAreValid && (
              <FormControl.ValidationMessage>
                Should be between 1 and 100
              </FormControl.ValidationMessage>
            )}
          </FormControl>
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
