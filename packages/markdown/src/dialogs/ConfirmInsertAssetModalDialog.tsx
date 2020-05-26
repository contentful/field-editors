import React from 'react';
import {
  Modal,
  Button,
  Paragraph,
  Typography,
  EntityList,
  EntityListItem,
} from '@contentful/forma-36-react-components';
import { css } from 'emotion';
import tokens from '@contentful/forma-36-tokens';
import { DialogsAPI } from 'contentful-ui-extensions-sdk';
import { MarkdownDialogType, MarkdownDialogsParams } from '../types';

const styles = {
  controlButton: css({
    marginTop: tokens.spacingL,
    button: {
      marginRight: tokens.spacingM,
    },
  }),
};

interface ConfirmInsertAssetModalDialogProps {
  onClose: (result: boolean) => void;
  assets: Array<{
    title: string;
    description: string;
    thumbnailUrl: string;
    thumbnailAltText: string;
  }>;
  locale: string;
}

export const ConfirmInsertAssetModalDialog = ({
  onClose,
  assets,
  locale,
}: ConfirmInsertAssetModalDialogProps) => {
  const localesNumber = assets.length;

  return (
    <Modal.Content testId="confirm-insert-asset">
      <Typography>
        <Paragraph>
          {localesNumber === 1
            ? `Link asset with missing file for locale ${locale}`
            : `Link assets with missing files for locale ${locale}`}
        </Paragraph>
        <Paragraph>
          {localesNumber === 1
            ? 'Do you want to link to the file in its fallback locale?'
            : 'Do you want to link to the files in their fallback locales?'}
        </Paragraph>
      </Typography>
      <EntityList>
        {assets.map(({ title, description, thumbnailUrl, thumbnailAltText }) => (
          <EntityListItem
            key={thumbnailUrl}
            title={title}
            thumbnailUrl={`${thumbnailUrl}?w=46&h=46&fit=thumb`}
            thumbnailAltText={thumbnailAltText}
            description={description}
          />
        ))}
      </EntityList>
      <div className={styles.controlButton}>
        <Button testId="confirm-insert-asset" onClick={() => onClose(true)} buttonType="positive">
          Confirm
        </Button>
        <Button onClick={() => onClose(false)} buttonType="muted">
          Cancel
        </Button>
      </div>
    </Modal.Content>
  );
};

export const openConfirmInsertAsset = (
  dialogs: DialogsAPI,
  options: {
    locale: string;
    assets: Array<{
      title: string;
      description: string;
      thumbnailUrl: string;
      thumbnailAltText: string;
    }>;
  }
): Promise<boolean> => {
  return dialogs.openCurrent({
    title: 'Confirm using fallback assets',
    width: 'medium',
    minHeight: '290px',
    shouldCloseOnEscapePress: true,
    shouldCloseOnOverlayClick: true,
    parameters: {
      type: MarkdownDialogType.confirmInsertAsset,
      ...options,
    } as MarkdownDialogsParams,
  });
};
