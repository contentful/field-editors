import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { css } from 'emotion';
import tokens from '@contentful/forma-36-tokens';
import { Modal, TextField, Button, Form } from '@contentful/forma-36-react-components';

const styles = {
  controlButton: css({
    button: {
      marginRight: tokens.spacingM
    }
  })
};

export const HyperlinkDialog = ({ onClose }) => {
  const mainInputRef = useRef(null);
  const [rows, setRows] = useState(2);
  const [cols, setColumns] = useState(1);

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
          onChange={e => setRows(Number(e.target.value))}
          textInputProps={{
            testId: 'insert-table-rows-number-field',
            min: 2,
            max: 100,
            pattern: '[1-9][0-9]*',
            type: 'number',
            width: 'small',
            autoComplete: 'off',
            inputRef: mainInputRef
          }}
          required
        />
        <TextField
          labelText="Number of columns"
          value={cols.toString()}
          id="insert-table-columns-number-field"
          name="columns"
          onChange={e => setColumns(Number(e.target.value))}
          textInputProps={{
            testId: 'insert-table-columns-number-field',
            min: 1,
            max: 100,
            pattern: '[1-9][0-9]*',
            type: 'number',
            width: 'small',
            autoComplete: 'off'
          }}
          required
        />
      </Form>
      <div className={styles.controlButton}>
        <Button
          testId="insert-table-confirm"
          onClick={() => onClose({ rows, cols })}
          buttonType="positive">
          Insert
        </Button>
        <Button testId="insert-table-cancel" onClick={() => onClose(false)} buttonType="muted">
          Cancel
        </Button>
      </div>
    </Modal.Content>
  );
};

HyperlinkDialog.propTypes = {
  onClose: PropTypes.func.isRequired
};

export const openHyperlinkDialog = (dialogs, params) => {
  return dialogs.openExtension({
    title: 'Insert hyperlink',
    width: 'medium',
    minHeight: '290px',
    shouldCloseOnEscapePress: true,
    shouldCloseOnOverlayClick: true,
    parameters: {
      type: 'rich-text-hyperlink-dialog',
      ...params
    }
  });
};
