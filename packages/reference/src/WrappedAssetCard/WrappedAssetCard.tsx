import React from 'react';
import { AssetCard } from '@contentful/forma-36-react-components';
import { AssetCardActions } from './AssetCardActions';
import { File } from '../types';
// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
import mimetype from '@contentful/mimetype';

const groupToIconMap = {
  image: 'image',
  video: 'video',
  audio: 'audio',
  richtext: 'richtext',
  presentation: 'presentation',
  spreadsheet: 'spreadsheet',
  pdfdocument: 'pdf',
  archive: 'archive',
  plaintext: 'plaintext',
  code: 'code',
  markup: 'markup'
};

export interface WrappedAssetCardProps {
  entityFile: File;
  entityTitle: string;
  entityStatus: 'archived' | 'changed' | 'draft' | 'published';
  isLoading: boolean;
  href?: string;
  className?: string;
  disabled: boolean;
  selected: boolean;
  onEdit: () => void;
  onRemove: () => void;
  onClick: () => void;
  readOnly: boolean;
  size: 'default' | 'small';
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getFileType(file?: File): any {
  if (!file) {
    return 'archive';
  }

  const groupName: keyof typeof groupToIconMap = mimetype.getGroupLabel({
    type: file.contentType,
    fallbackFileName: file.fileName
  });

  return groupToIconMap[groupName] || 'archive';
}

export default class WrappedAssetCard extends React.Component<WrappedAssetCardProps> {
  renderAssetActions() {
    return (
      <AssetCardActions
        entityFile={this.props.entityFile}
        isDisabled={this.props.disabled}
        onEdit={this.props.onEdit}
        onRemove={this.props.onRemove}
      />
    );
  }

  render() {
    const {
      entityFile,
      entityTitle,
      className,
      href,
      entityStatus,
      isLoading,
      onClick,
      size,
      readOnly
    } = this.props;

    return (
      <AssetCard
        type={getFileType(entityFile)}
        title={entityTitle || 'Untitled'}
        className={className}
        href={href}
        status={entityStatus}
        src={
          entityFile
            ? size === 'small'
              ? `${entityFile.url}?w=150&h=150&fit=thumb`
              : `${entityFile.url}?h=300`
            : ''
        }
        isLoading={isLoading}
        onClick={onClick}
        // cardDragHandleComponent={cardDragHandleComponent}
        // withDragHandle={!!cardDragHandleComponent}
        // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
        // @ts-ignore
        dropdownListElements={readOnly ? null : this.renderAssetActions()}
        size={size}
      />
    );
  }
}
