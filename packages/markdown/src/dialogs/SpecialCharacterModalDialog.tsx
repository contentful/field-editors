import React, { useState } from 'react';
import { DialogsAPI } from '@contentful/app-sdk';
import { css } from 'emotion';
import tokens from '@contentful/f36-tokens';
import {
  ModalContent,
  ModalControls,
  Text,
  Flex,
  Button,
  Tooltip,
} from '@contentful/f36-components';
import { specialCharacters } from '../utils/specialCharacters';
import { MarkdownDialogType, MarkdownDialogsParams } from '../types';

const styles = {
  buttonPanel: css({
    display: 'flex',
    flexWrap: 'wrap',
  }),
  charButton: css({
    border: `1px solid ${tokens.gray500}`,
    width: '4.1rem',
    height: '4.1rem',
    fontSize: tokens.fontSizeXl,
    marginTop: tokens.spacing2Xs,
    marginRight: tokens.spacing2Xs,
  }),
  selectedCharButton: css({
    backgroundColor: tokens.gray100,
  }),
  tooltip: css({ zIndex: 1000 }),
  button: css({
    marginTop: tokens.spacingM,
    marginRight: tokens.spacingS,
  }),
};

export type SpecialCharacterModalResult = string | false | undefined;

type SpecialCharacterModalDialogProps = {
  onClose: (result: SpecialCharacterModalResult) => void;
};

export const SpecialCharacterModalDialog = ({ onClose }: SpecialCharacterModalDialogProps) => {
  const [selectedCharacter, setSelectedCharacter] = useState<{ code: number; desc: string }>(
    specialCharacters[0]
  );
  return (
    <>
      <ModalContent testId="insert-special-character-modal">
        <Flex flexDirection="column" alignItems="center">
          <Text as="div" lineHeight="lineHeight3Xl" fontSize="fontSize3Xl" marginBottom="spacingS">
            {String.fromCharCode(selectedCharacter.code)}
          </Text>
          <Text as="div" marginBottom="spacingS">
            {selectedCharacter.desc}
          </Text>
        </Flex>
        <div className={styles.buttonPanel}>
          {specialCharacters.map((char) => (
            <div key={char.code}>
              <Tooltip className={styles.tooltip} content={char.desc}>
                <Button
                  testId="special-character-button"
                  isActive={char.code === selectedCharacter.code}
                  className={styles.charButton}
                  variant="transparent"
                  onClick={() => setSelectedCharacter(char)}>
                  {String.fromCharCode(char.code)}
                </Button>
              </Tooltip>
            </div>
          ))}
        </div>
      </ModalContent>
      <ModalControls>
        <Button
          testId="insert-character-cancel"
          className={styles.button}
          onClick={() => onClose(false)}
          variant="secondary"
          size="small">
          Cancel
        </Button>
        <Button
          className={styles.button}
          testId="insert-character-confirm"
          onClick={() => onClose(String.fromCharCode(selectedCharacter.code))}
          variant="positive"
          size="small">
          Insert selected
        </Button>
      </ModalControls>
    </>
  );
};

export const openInsertSpecialCharacter = (
  dialogs: DialogsAPI
): Promise<SpecialCharacterModalResult> => {
  return dialogs.openCurrent({
    title: 'Insert special character',
    width: 'large',
    minHeight: '600px',
    shouldCloseOnEscapePress: true,
    shouldCloseOnOverlayClick: true,
    parameters: {
      type: MarkdownDialogType.insertSpecialCharacter,
    } as MarkdownDialogsParams,
  });
};
