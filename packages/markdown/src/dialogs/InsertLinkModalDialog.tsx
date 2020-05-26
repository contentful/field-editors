import React, { useState, useRef, useEffect } from 'react';
import { css } from 'emotion';
import { DialogsAPI } from 'contentful-ui-extensions-sdk';
import { MarkdownDialogType, MarkdownDialogsParams } from '../types';
import tokens from '@contentful/forma-36-tokens';
import { Modal, TextField, Form, Button } from '@contentful/forma-36-react-components';
import { isValidUrl } from '../utils/isValidUrl';

const styles = {
  controlsContainer: css({
    display: 'flex',
    button: {
      marginRight: tokens.spacingM,
    },
  }),
};

type InsertLinkModalPositiveResult = { url: string; text: string; title: string };
export type InsertLinkModalResult = InsertLinkModalPositiveResult | false | undefined;

type InsertLinkModalProps = {
  selectedText?: string;
  onClose: (result: InsertLinkModalResult) => void;
};

export const InsertLinkModal = ({ selectedText, onClose }: InsertLinkModalProps) => {
  const mainInputRef = useRef<HTMLInputElement>(null);
  const [text, setText] = useState(selectedText || '');
  const [url, setUrl] = useState('');
  const [touched, setTouched] = useState(false);
  const [title, setTitle] = useState('');
  const onInsert = (values: InsertLinkModalPositiveResult) => onClose(values);

  const urlIsValid = isValidUrl(url);

  useEffect(() => {
    if (mainInputRef?.current?.focus) {
      mainInputRef.current.focus();
    }
  }, [mainInputRef]);

  return (
    <Modal.Content testId="insert-link-modal">
      <Form onSubmit={() => onInsert({ url, text, title })}>
        <TextField
          value={text}
          name="link-text"
          id="link-text-field"
          labelText="Link text"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setText(e.target.value);
          }}
          textInputProps={{
            disabled: Boolean(selectedText),
            testId: 'link-text-field',
          }}
        />
        <TextField
          value={url}
          name="target-url"
          id="target-url-field"
          labelText="Target URL"
          helpText="Include protocol (e.g. https://)"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setUrl(e.target.value);
            setTouched(true);
          }}
          validationMessage={touched && !urlIsValid ? 'Invalid URL' : ''}
          textInputProps={{
            placeholder: 'https://',
            maxLength: 2100,
            testId: 'target-url-field',
            inputRef: mainInputRef,
          }}
        />
        <TextField
          value={title}
          name="link-title"
          id="link-title-field"
          labelText="Link title"
          helpText="Recommended for accessibility"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setTitle(e.target.value);
          }}
          textInputProps={{
            testId: 'link-title-field',
          }}
        />
      </Form>
      <div className={styles.controlsContainer}>
        <Button
          testId="insert-link-confirm"
          onClick={() => {
            onInsert({ url, text, title });
          }}
          disabled={!urlIsValid}
          buttonType="positive">
          Insert
        </Button>
        <Button testId="insert-link-cancel" onClick={() => onClose(false)} buttonType="muted">
          Cancel
        </Button>
      </div>
    </Modal.Content>
  );
};

export const openInsertLinkDialog = (
  dialogs: DialogsAPI,
  params: { selectedText?: string }
): Promise<InsertLinkModalResult> => {
  return dialogs.openCurrent({
    title: 'Insert link',
    width: 'large',
    minHeight: '441px',
    shouldCloseOnEscapePress: true,
    shouldCloseOnOverlayClick: true,
    parameters: {
      type: MarkdownDialogType.insertLink,
      ...params,
    } as MarkdownDialogsParams,
  });
};
