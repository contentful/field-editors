import * as React from 'react';

import { Menu, Text } from '@contentful/f36-components';
import tokens from '@contentful/f36-tokens';
import { shortenStorageUnit } from '@contentful/field-editor-shared';
import { css } from 'emotion';
import get from 'lodash/get';

import { File } from '../../types';

const styles = {
  dragHandle: css({
    alignSelf: 'stretch',
  }),
  fileInformation: {
    menuItem: css({
      opacity: 1,
    }),
    dl: css({
      backgroundColor: tokens.gray100,
      borderRadius: tokens.borderRadiusMedium,
      padding: tokens.spacingXs,
      width: '200px',
      lineHeight: tokens.lineHeightS,
      fontSize: tokens.fontSizeS,
      dt: {
        font: 'inherit',
        color: tokens.gray700,
        marginRight: tokens.spacingXs,
        paddingTop: tokens.spacing2Xs,
        paddingBottom: tokens.spacing2Xs,
        float: 'left',
        clear: 'left',
      },
      dd: {
        font: 'inherit',
        marginLeft: 0,
        color: tokens.gray900,
        paddingTop: tokens.spacing2Xs,
        paddingBottom: tokens.spacing2Xs,
      },
    }),
  },
};

function downloadAsset(url: string) {
  window.open(url, '_blank', 'noopener,noreferrer');
}

export function renderAssetInfo(props: { entityFile: File }) {
  const { entityFile } = props;
  const fileName = get(entityFile, 'fileName');
  const mimeType = get(entityFile, 'contentType');
  const fileSize = get(entityFile, 'details.size');
  const image = get(entityFile, 'details.image');

  return [
    <Menu.SectionTitle key="file-section">File info</Menu.SectionTitle>,
    <Menu.Item key="file-information" className={styles.fileInformation.menuItem} isDisabled>
      <dl className={styles.fileInformation.dl}>
        {fileName && (
          <>
            <dt>File Name:</dt>
            <Text as="dd" isTruncated>
              {fileName}
            </Text>
          </>
        )}
        {mimeType && (
          <>
            <dt>File Type:</dt>
            <Text as="dd" isTruncated>
              {mimeType}
            </Text>
          </>
        )}
        {fileSize && (
          <>
            <dt>Size:</dt>
            <dd>{shortenStorageUnit(fileSize, 'B')}</dd>
          </>
        )}
        {image && (
          <>
            <dt>Dimensions:</dt>
            <dd>{`${image.width} × ${image.height}`}</dd>
          </>
        )}
      </dl>
    </Menu.Item>,
  ];
}

export function renderActions(props: {
  onEdit?: () => void;
  onRemove?: () => void;
  isDisabled: boolean;
  entityFile?: File;
}) {
  const { entityFile, isDisabled, onEdit, onRemove } = props;

  return [
    <Menu.SectionTitle key="section-title">Actions</Menu.SectionTitle>,
    onEdit ? (
      <Menu.Item key="edit" onClick={onEdit} testId="card-action-edit">
        Edit
      </Menu.Item>
    ) : null,
    entityFile ? (
      <Menu.Item
        key="download"
        onClick={() => {
          if (typeof entityFile.url === 'string') {
            downloadAsset(entityFile.url);
          }
        }}
        testId="card-action-download"
      >
        Download
      </Menu.Item>
    ) : null,
    onRemove ? (
      <Menu.Item key="remove" disabled={isDisabled} onClick={onRemove} testId="card-action-remove">
        Remove
      </Menu.Item>
    ) : null,
  ].filter((item) => item);
}
