import React, { useState, useRef, useEffect } from 'react';
import { css } from 'emotion';
import tokens from '@contentful/f36-tokens';
import { DialogsAPI } from '@contentful/app-sdk';
import { MarkdownDialogType, MarkdownDialogsParams } from '../types';
import {
  ModalContent,
  ModalControls,
  Text,
  TextLink,
  Button,
  Checkbox,
  Radio,
  Form,
  FormControl,
  TextInput,
} from '@contentful/f36-components';
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
    <>
      <ModalContent testId="embed-external-dialog">
        <Form>
          <FormControl id="external-link-url-field" isRequired isInvalid={!urlIsValid}>
            <FormControl.Label>Content URL</FormControl.Label>
            <TextInput
              name="external-link-url"
              value={url}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const value = e.target.value;
                setUrl(value);
                setUrlValidity(isValidUrl(value));
              }}
              testId="external-link-url-field"
              placeholder="https://example.com"
              ref={mainInputRef}
            />
            <FormControl.HelpText>Include protocol (e.g. https://)</FormControl.HelpText>
            {!urlIsValid && (
              <FormControl.ValidationMessage>URL is invalid</FormControl.ValidationMessage>
            )}
          </FormControl>
          <TextLink href="http://embed.ly/providers" target="_blank" rel="noopener noreferrer">
            Supported sources
          </TextLink>
          <div className={styles.widthFiledGroup}>
            <FormControl
              id="embedded-content-width"
              isRequired
              isInvalid={!isWidthValid(Number(width), selectedUnit)}>
              <FormControl.Label>Width</FormControl.Label>
              <TextInput
                value={width}
                name="embedded-content-width"
                testId="embedded-content-width"
                type="number"
                width="small"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setWidth(e.target.value)}
              />
              {!isWidthValid(Number(width), selectedUnit) && (
                <FormControl.ValidationMessage>
                  Should be equal or less then 100
                </FormControl.ValidationMessage>
              )}
            </FormControl>

            <div className={styles.radioButtonGroup}>
              <Radio
                id="unit-option-percent"
                value="percent"
                isChecked={selectedUnit === 'percent'}
                onChange={() => setUnit('percent')}
                className={styles.radioButton}>
                percent
              </Radio>
              <Radio
                id="unit-option-pixels"
                value="pixels"
                isChecked={selectedUnit === 'px'}
                onChange={() => setUnit('px')}
                className={styles.radioButton}>
                pixels
              </Radio>
            </div>
          </div>
          <Checkbox
            id="attach-social-checkbox"
            name="attach-social-checkbox"
            value="Yes"
            isChecked={attachSocial}
            onChange={() => setAttachSocial(!attachSocial)}
            testId="attach-social-checkbox">
            Attach social sharing links to this element
          </Checkbox>
          <Text as="p" fontColor="gray500" marginTop="spacingXs">
            To enable this embedded content in your application make sure to add the&nbsp;
            <TextLink
              href="http://embed.ly/docs/products/cards"
              target="_blank"
              rel="noopener noreferrer">
              Embedly&apos;s platform.js
            </TextLink>
            &nbsp;on your development environment
          </Text>
          {/* <EmbedlyPreview previewUrl={url} /> */}
        </Form>
      </ModalContent>
      <ModalControls>
        <Button
          testId="emded-external-cancel"
          onClick={() => onClose(false)}
          variant="secondary"
          size="small">
          Cancel
        </Button>
        <Button
          testId="embed-external-confirm"
          onClick={() =>
            onClose(makeEmbedlyLink({ url, width: Number(width), selectedUnit, attachSocial }))
          }
          variant="positive"
          size="small">
          Insert
        </Button>
      </ModalControls>
    </>
  );
};

export const openEmbedExternalContentDialog = (
  dialogs: DialogsAPI
): Promise<EmbedExternalContentModalResult> => {
  return dialogs.openCurrent({
    title: 'Embed external content',
    width: 'large',
    minHeight: '435px',
    shouldCloseOnEscapePress: true,
    shouldCloseOnOverlayClick: true,
    parameters: {
      type: MarkdownDialogType.embedExternalContent,
    } as MarkdownDialogsParams,
  });
};
