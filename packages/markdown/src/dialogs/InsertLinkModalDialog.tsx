import React, { useState, useRef, useEffect } from 'react';
import { DialogsAPI } from '@contentful/app-sdk';
import { MarkdownDialogType, MarkdownDialogsParams } from '../types';
import {
  ModalContent,
  ModalControls,
  Button,
  Form,
  FormControl,
  TextInput,
} from '@contentful/f36-components';
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
          <FormControl id="link-text-field" isDisabled={Boolean(selectedText)}>
            <FormControl.Label>Link text</FormControl.Label>
            <TextInput
              name="link-text"
              value={text}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setText(e.target.value);
              }}
              testId="link-text-field"
            />
          </FormControl>

          <FormControl id="target-url-field" isInvalid={touched && !urlIsValid}>
            <FormControl.Label>Target URL</FormControl.Label>
            <TextInput
              name="target-url"
              value={url}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setUrl(e.target.value);
                setTouched(true);
              }}
              placeholder="https://"
              maxLength={2100}
              testId="target-url-field"
              ref={mainInputRef}
            />
            <FormControl.HelpText>Include protocol (e.g. https://)</FormControl.HelpText>
            {touched && !urlIsValid && (
              <FormControl.ValidationMessage>Invalid URL</FormControl.ValidationMessage>
            )}
          </FormControl>

          <FormControl id="link-title-field">
            <FormControl.Label>Link title</FormControl.Label>
            <TextInput
              name="link-title"
              value={title}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setTitle(e.target.value);
              }}
              testId="link-title-field"
            />
            <FormControl.HelpText>
              Extra link information, usually shown as a tooltip on mouse hover
            </FormControl.HelpText>
          </FormControl>
        </Form>
      </ModalContent>
      <ModalControls>
        <Button
          testId="insert-link-cancel"
          onClick={() => onClose(false)}
          variant="secondary"
          size="small">
          Cancel
        </Button>
        <Button
          testId="insert-link-confirm"
          onClick={() => {
            onInsert({ url, text, title });
          }}
          isDisabled={!urlIsValid}
          variant="positive"
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
