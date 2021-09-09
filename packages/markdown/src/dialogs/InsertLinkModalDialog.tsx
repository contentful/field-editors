import React, { useState, useRef, useEffect } from 'react';
import { DialogsAPI } from '@contentful/app-sdk';
import { MarkdownDialogType, MarkdownDialogsParams } from '../types';
import { TextField, Form, Button } from '@contentful/forma-36-react-components';
import { ModalContent, ModalControls } from '@contentful/f36-components';
import { isValidUrl } from '../utils/isValidUrl';

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
    <>
      <ModalContent testId="insert-link-modal">
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
      </ModalContent>
      <ModalControls>
        <Button
          testId="insert-link-cancel"
          onClick={() => onClose(false)}
          buttonType="muted"
          size="small">
          Cancel
        </Button>
        <Button
          testId="insert-link-confirm"
          onClick={() => {
            onInsert({ url, text, title });
          }}
          disabled={!urlIsValid}
          buttonType="positive"
          size="small">
          Insert
        </Button>
      </ModalControls>
    </>
  );
};

export const openInsertLinkDialog = (
  dialogs: DialogsAPI,
  params: { selectedText?: string }
): Promise<InsertLinkModalResult> => {
  return dialogs.openCurrent({
    title: 'Insert link',
    width: 'large',
    minHeight: '410px',
    shouldCloseOnEscapePress: true,
    shouldCloseOnOverlayClick: true,
    parameters: {
      type: MarkdownDialogType.insertLink,
      ...params,
    } as MarkdownDialogsParams,
  });
};
