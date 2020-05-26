import React, { useState } from 'react';
import { DialogsAPI } from 'contentful-ui-extensions-sdk';
import { css } from 'emotion';
import tokens from '@contentful/forma-36-tokens';
import { Modal, Button, Tooltip, DisplayText } from '@contentful/forma-36-react-components';
import { specialCharacters } from '../utils/specialCharacters';
import { MarkdownDialogType, MarkdownDialogsParams } from '../types';

const styles = {
  buttonPanel: css({
    display: 'flex',
    flexWrap: 'wrap',
  }),
  charButton: css({
    border: `1px solid ${tokens.colorElementDarkest}`,
    width: '4.1rem',
    height: '4.1rem',
    fontSize: tokens.fontSizeXl,
    marginTop: tokens.spacing2Xs,
    marginRight: tokens.spacing2Xs,
  }),
  selectedCharButton: css({
    backgroundColor: tokens.colorElementLightest,
  }),
  tooltip: css({ zIndex: 1000 }),
  button: css({
    marginTop: tokens.spacingM,
    marginRight: tokens.spacingS,
  }),
  charContainer: css({
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    marginBottom: tokens.spacingM,
  }),
  selectedCharacter: css({
    fontSize: tokens.fontSize3Xl,
    margin: 'auto',
  }),
  selectedCharacterDesc: css({
    fontSize: tokens.fontSizeM,
    margin: 'auto',
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
    <Modal.Content testId="insert-special-character-modal">
      <div className={styles.charContainer}>
        <DisplayText element="p" className={styles.selectedCharacter}>
          {String.fromCharCode(selectedCharacter.code)}
        </DisplayText>
        <DisplayText element="p" className={styles.selectedCharacterDesc}>
          {selectedCharacter.desc}
        </DisplayText>
      </div>
      <div className={styles.buttonPanel}>
        {specialCharacters.map((char) => (
          <div key={char.code}>
            <Tooltip className={styles.tooltip} content={char.desc}>
              <Button
                testId="special-character-button"
                isActive={char.code === selectedCharacter.code}
                className={styles.charButton}
                buttonType="naked"
                onClick={() => setSelectedCharacter(char)}>
                {String.fromCharCode(char.code)}
              </Button>
            </Tooltip>
          </div>
        ))}
      </div>
      <Button
        className={styles.button}
        testId="insert-character-confirm"
        onClick={() => onClose(String.fromCharCode(selectedCharacter.code))}
        buttonType="positive">
        Insert selected
      </Button>
      <Button
        testId="insert-character-cancel"
        className={styles.button}
        onClick={() => onClose(false)}
        buttonType="muted">
        Cancel
      </Button>
    </Modal.Content>
  );
};

export const openInsertSpecialCharacter = (
  dialogs: DialogsAPI
): Promise<SpecialCharacterModalResult> => {
  return dialogs.openCurrent({
    title: 'Insert special character',
    width: 'large',
    minHeight: '615px',
    shouldCloseOnEscapePress: true,
    shouldCloseOnOverlayClick: true,
    parameters: {
      type: MarkdownDialogType.insertSpecialCharacter,
    } as MarkdownDialogsParams,
  });
};
