import React from 'react';
import { DropdownList, DropdownListItem } from '@contentful/forma-36-react-components';
import { css } from 'emotion';
import { File } from '../../types';
import get from 'lodash/get';

import { shortenStorageUnit } from './shortenStorageUnit';

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
    <DropdownList
      border="top"
      className={styles.cardDropdown}
      // @ts-expect-error
      onClick={(e) => {
        e.stopPropagation();
      }}>
      <DropdownListItem isTitle>File info</DropdownListItem>
      {fileName && (
        <DropdownListItem>
          <div className={styles.truncated}>{fileName}</div>
        </DropdownListItem>
      )}
      {mimeType && (
        <DropdownListItem>
          <div>{mimeType}</div>
        </DropdownListItem>
      )}
      {fileSize && <DropdownListItem>{shortenStorageUnit(fileSize, 'B')}</DropdownListItem>}
      {image && <DropdownListItem>{`${image.width} × ${image.height}`}</DropdownListItem>}
    </DropdownList>
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
    <DropdownList
      className={styles.cardDropdown}
      // @ts-expect-error
      onClick={(e) => {
        e.stopPropagation();
      }}>
      <DropdownListItem isTitle>Actions</DropdownListItem>
      {onEdit && (
        <DropdownListItem onClick={onEdit} testId="card-action-edit">
          Edit
        </DropdownListItem>
      )}
      {entityFile && (
        <DropdownListItem
          onClick={() => downloadAsset(entityFile.url)}
          testId="card-action-download">
          Download
        </DropdownListItem>
      )}
      {onRemove && (
        <DropdownListItem isDisabled={isDisabled} onClick={onRemove} testId="card-action-remove">
          Remove
        </DropdownListItem>
      )}
    </DropdownList>
  );
}
