import * as React from 'react';

import { Menu, Text } from '@contentful/f36-components';
import { shortenStorageUnit } from '@contentful/field-editor-shared';
import get from 'lodash/get';

import { File } from '../../types';

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
    fileName && (
      <Menu.Item key="file-name">
        <Text isTruncated>{fileName}</Text>
      </Menu.Item>
    ),
    mimeType && (
      <Menu.Item key="file-type">
        <Text isTruncated>{mimeType}</Text>
      </Menu.Item>
    ),
    fileSize && <Menu.Item key="file-size">{shortenStorageUnit(fileSize, 'B')}</Menu.Item>,
    image && <Menu.Item key="file-dimentions">{`${image.width} × ${image.height}`}</Menu.Item>,
  ].filter((item) => item);
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
