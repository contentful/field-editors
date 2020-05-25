import React, { useState, useRef, useEffect } from 'react';
import { css } from 'emotion';
import tokens from '@contentful/forma-36-tokens';
import { DialogsAPI } from 'contentful-ui-extensions-sdk';
import { MarkdownDialogType, MarkdownDialogsParams } from '../types';
import {
  Modal,
  HelpText,
  TextLink,
  TextField,
  RadioButtonField,
  CheckboxField,
  Button,
  Form,
} from '@contentful/forma-36-react-components';
import { isValidUrl } from '../utils/isValidUrl';

const styles = {
  widthFiledGroup: css({
    display: 'flex',
    flexWrap: 'nowrap',
    alignItems: 'flex-start',
  }),
  radioButtonGroup: css({
    display: 'inline-flex',
    alignItems: 'flex-start',
    paddingTop: tokens.spacingXl,
  }),
  radioButton: css({
    marginLeft: tokens.spacingM,
  }),
  controlsContainer: css({
    display: 'flex',
    button: {
      marginRight: tokens.spacingM,
    },
  }),
};

export type EmbedExternalContentModalResult = string | false | undefined;

type EmbedExternalContentModalProps = {
  onClose: (result: EmbedExternalContentModalResult) => void;
};

type Unit = 'percent' | 'px';

const makeEmbedlyLink = ({
  url,
  width,
  selectedUnit,
  attachSocial,
}: {
  url: string;
  width: number;
  selectedUnit: Unit;
  attachSocial: boolean;
}): string => {
  const s = { percent: '%', px: 'px' };
  return [
    '<a href="' + url + '" class="embedly-card" ',
    'data-card-width="' + width + s[selectedUnit] + '" ',
    'data-card-controls="' + (attachSocial ? '1' : '0') + '"',
    '>Embedded content: ' + url + '</a>',
  ].join('');
};

const isWidthValid = (width: number, unit: Unit) => (unit === 'percent' ? width <= 100 : true);

export const EmbedExternalContentModal = ({ onClose }: EmbedExternalContentModalProps) => {
  const mainInputRef = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState<string>('https://');
  const [selectedUnit, setUnit] = useState<Unit>('percent');
  const [urlIsValid, setUrlValidity] = useState<boolean>(true);
  const [width, setWidth] = useState('100');
  const [attachSocial, setAttachSocial] = useState(false);

  useEffect(() => {
    if (mainInputRef.current?.focus) {
      mainInputRef.current.focus();
    }
  }, [mainInputRef]);

  return (
    <Modal.Content testId="embed-external-dialog">
      <Form>
        <TextField
          value={url}
          name="external-link-url"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            const value = e.target.value;
            setUrl(value);
            setUrlValidity(isValidUrl(value));
          }}
          labelText="Content URL"
          id="external-link-url-field"
          helpText="Include protocol (e.g. https://)"
          textInputProps={{
            testId: 'external-link-url-field',
            placeholder: 'https://example.com',
            inputRef: mainInputRef,
          }}
          required
          validationMessage={urlIsValid ? '' : 'URL is invalid'}
        />
        <TextLink href="http://embed.ly/providers" target="_blank" rel="noopener noreferrer">
          Supported sources
        </TextLink>
        <div className={styles.widthFiledGroup}>
          <TextField
            value={width}
            id="embedded-content-width"
            name="embedded-content-width"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setWidth(e.target.value)}
            labelText="Width"
            textInputProps={{
              testId: 'embedded-content-width',
              type: 'number',
              width: 'small',
            }}
            required
            validationMessage={
              isWidthValid(Number(width), selectedUnit) ? '' : 'Should be equal or less then 100'
            }
          />
          <div className={styles.radioButtonGroup}>
            <RadioButtonField
              className={styles.radioButton}
              id="unit-option-percent"
              checked={selectedUnit === 'percent'}
              labelText="percent"
              value="percent"
              onChange={() => setUnit('percent')}
              labelIsLight
            />
            <RadioButtonField
              className={styles.radioButton}
              id="unit-option-pixels"
              checked={selectedUnit === 'px'}
              labelText="pixels"
              value="pixels"
              onChange={() => setUnit('px')}
              labelIsLight
            />
          </div>
        </div>
        <CheckboxField
          value="Yes"
          testId="attach-social-checkbox"
          id="attach-social-checkbox"
          name="attach-social-checkbox"
          checked={attachSocial}
          onChange={() => setAttachSocial(!attachSocial)}
          labelText="Attach social sharing links to this element"
          labelIsLight
        />
        <HelpText>
          To enable this embedded content in your application make sure to add the&nbsp;
          <TextLink
            href="http://embed.ly/docs/products/cards"
            target="_blank"
            rel="noopener noreferrer">
            Embedly&apos;s platform.js
          </TextLink>
          &nbsp;on your development environment
        </HelpText>
        {/* <EmbedlyPreview previewUrl={url} /> */}
      </Form>
      <div className={styles.controlsContainer}>
        <Button
          testId="embed-external-confirm"
          onClick={() =>
            onClose(makeEmbedlyLink({ url, width: Number(width), selectedUnit, attachSocial }))
          }
          buttonType="positive">
          Insert
        </Button>
        <Button testId="emded-external-cancel" onClick={() => onClose(false)} buttonType="muted">
          Cancel
        </Button>
      </div>
    </Modal.Content>
  );
};

export const openEmbedExternalContentDialog = (
  dialogs: DialogsAPI
): Promise<EmbedExternalContentModalResult> => {
  return dialogs.openCurrent({
    title: 'Embed external content',
    width: 'large',
    minHeight: '475px',
    shouldCloseOnEscapePress: true,
    shouldCloseOnOverlayClick: true,
    parameters: {
      type: MarkdownDialogType.embedExternalContent,
    } as MarkdownDialogsParams,
  });
};
