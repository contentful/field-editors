import React from 'react';
import { DropdownList, DropdownListItem } from '@contentful/forma-36-react-components';
import { css } from 'emotion';
import { File } from '../types';
import get from 'lodash/get';

import { shortenStorageUnit } from './shortenStorageUnit';

const styles = {
  cardDropdown: css({
    width: '300px'
  })
};

function downloadAsset(url: string) {
  window.open(url, '_blank');
}

export class AssetCardActions extends React.PureComponent<{
  onEdit: () => void;
  onRemove: () => void;
  isDisabled: boolean;
  entityFile: File;
}> {
  renderActions() {
    const { entityFile, isDisabled, onEdit, onRemove } = this.props;
    return (
      <DropdownList
        className={styles.cardDropdown}
        // @ts-ignore
        onClick={e => {
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

  renderAssetInfo() {
    const { entityFile } = this.props;
    const fileName = get(entityFile, 'fileName');
    const mimeType = get(entityFile, 'contentType');
    const fileSize = get(entityFile, 'details.size');
    const image = get(entityFile, 'details.image');
    return (
      <DropdownList
        border="top"
        className={styles.cardDropdown}
        // @ts-ignore
        onClick={e => {
          e.stopPropagation();
        }}>
        <DropdownListItem isTitle>File info</DropdownListItem>
        {fileName && (
          <DropdownListItem>
            <div>{fileName}</div>
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

  render() {
    return (
      <React.Fragment>
        {this.renderActions()}
        {this.renderAssetInfo()}
      </React.Fragment>
    );
  }
}
