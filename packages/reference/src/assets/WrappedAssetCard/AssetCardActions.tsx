import React from 'react';
import { Menu } from '@contentful/f36-components';
import { shortenStorageUnit } from '@contentful/field-editor-shared';
import { css } from 'emotion';
import { File } from '../../types';
import get from 'lodash/get';

const styles = {
  cardDropdown: css({
    width: '300px',
  }),
  truncated: css({
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
  }),
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
  return (
    <Menu.List
      className={styles.cardDropdown}
      key="asset-info"
      onClick={(e) => {
        e.stopPropagation();
      }}>
      <Menu.SectionTitle>File info</Menu.SectionTitle>
      {fileName && (
        <Menu.Item>
          <div className={styles.truncated}>{fileName}</div>
        </Menu.Item>
      )}
      {mimeType && (
        <Menu.Item>
          <div>{mimeType}</div>
        </Menu.Item>
      )}
      {fileSize && <Menu.Item>{shortenStorageUnit(fileSize, 'B')}</Menu.Item>}
      {image && <Menu.Item>{`${image.width} × ${image.height}`}</Menu.Item>}
    </Menu.List>
  );
}

export function renderActions(props: {
  onEdit?: () => void;
  onRemove?: () => void;
  isDisabled: boolean;
  entityFile?: File;
}) {
  const { entityFile, isDisabled, onEdit, onRemove } = props;
  return (
    <Menu.List
      className={styles.cardDropdown}
      key="actions"
      onClick={(e) => {
        e.stopPropagation();
      }}>
      <Menu.SectionTitle>Actions</Menu.SectionTitle>
      {onEdit && (
        <Menu.Item onClick={onEdit} testId="card-action-edit">
          Edit
        </Menu.Item>
      )}
      {entityFile && (
        <Menu.Item
          onClick={() => {
            if (typeof entityFile.url === 'string') {
              downloadAsset(entityFile.url);
            }
          }}
          testId="card-action-download">
          Download
        </Menu.Item>
      )}
      {onRemove && (
        <Menu.Item disabled={isDisabled} onClick={onRemove} testId="card-action-remove">
          Remove
        </Menu.Item>
      )}
    </Menu.List>
  );
}
