import React from 'react';
import {
  ModalContent,
  ModalControls,
  Paragraph,
  Button,
  EntityList,
} from '@contentful/f36-components';
import { DialogsAPI } from '@contentful/app-sdk';
import { MarkdownDialogType, MarkdownDialogsParams } from '../types';

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
    <>
      <ModalContent testId="confirm-insert-asset">
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
        <EntityList>
          {assets.map(({ title, description, thumbnailUrl, thumbnailAltText }) => (
            <EntityList.Item
              key={thumbnailUrl}
              title={title}
              thumbnailUrl={`${thumbnailUrl}?w=46&h=46&fit=thumb`}
              thumbnailAltText={thumbnailAltText}
              description={description}
            />
          ))}
        </EntityList>
      </ModalContent>
      <ModalControls>
        <Button onClick={() => onClose(false)} variant="secondary" size="small">
          Cancel
        </Button>
        <Button
          testId="confirm-insert-asset"
          onClick={() => onClose(true)}
          variant="positive"
          size="small">
          Confirm
        </Button>
      </ModalControls>
    </>
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
    minHeight: '270px',
    shouldCloseOnEscapePress: true,
    shouldCloseOnOverlayClick: true,
    parameters: {
      type: MarkdownDialogType.confirmInsertAsset,
      ...options,
    } as MarkdownDialogsParams,
  });
};
