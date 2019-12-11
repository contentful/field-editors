import React, { useState } from 'react';
import { css } from 'emotion';
import { DialogsAPI } from 'contentful-ui-extensions-sdk';
import tokens from '@contentful/forma-36-tokens';
import { Modal, TextField, Form, Button } from '@contentful/forma-36-react-components';
import { isValidUrl } from '../utils/isValidUrl';
import { MarkdownDialogType, MarkdownDialogsParams } from '../types';

const styles = {
  controlsContainer: css({
    display: 'flex',
    button: {
      marginRight: tokens.spacingM
    }
  })
};

type InsertLinkModalPositiveResult = { url: string; text: string; title: string };
export type InsertLinkModalResult = InsertLinkModalPositiveResult | false | undefined;

type InsertLinkModalProps = {
  selectedText?: string;
  onClose: (result: InsertLinkModalResult) => void;
};

export const InsertLinkModal = ({ selectedText, onClose }: InsertLinkModalProps) => {
  const [text, setText] = useState('');
  const [url, setUrl] = useState('https://');
  const [urlIsValid, setUrlValidity] = useState(true);
  const [title, setTitle] = useState('');
  const onInsert = (values: InsertLinkModalPositiveResult) => onClose(values);
  return (
    <Modal.Content>
      <Form onSubmit={() => onInsert({ url, text, title })}>
        {!selectedText && (
          <TextField
            value={text}
            name="link-text"
            id="link-text-field"
            labelText="Link text"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setText(e.target.value)}
            textInputProps={{
              testId: 'link-text-field'
            }}
          />
        )}
        <TextField
          value={url}
          name="target-url"
          id="target-url-field"
          labelText="Target URL"
          helpText="Include protocol (e.g. https://)"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setUrl(e.target.value);
            setUrlValidity(isValidUrl(e.target.value));
          }}
          validationMessage={urlIsValid ? '' : 'Invalid URL'}
          textInputProps={{
            placeholder: 'https://example.com',
            maxLength: 2100,
            testId: 'target-url-field'
          }}
        />
        <TextField
          value={title}
          name="link-title"
          id="link-title-field"
          labelText="Link title"
          helpText="Recommended for accessibility"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
          textInputProps={{
            testId: 'link-title-field'
          }}
        />
      </Form>
      <div className={styles.controlsContainer}>
        <Button
          testId="insert-link-confirm"
          onClick={() => onInsert({ url, text, title })}
          buttonType="positive">
          Insert
        </Button>
        <Button onClick={() => onClose(false)} buttonType="muted">
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
  return dialogs.openExtension({
    title: 'Insert link',
    width: 700,
    shouldCloseOnEscapePress: true,
    shouldCloseOnOverlayClick: true,
    parameters: {
      type: MarkdownDialogType.insertLink,
      ...params
    } as MarkdownDialogsParams
  });
};
