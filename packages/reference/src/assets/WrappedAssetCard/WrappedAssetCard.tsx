import React from 'react';
import { AssetCard } from '@contentful/forma-36-react-components';
import { renderActions, renderAssetInfo } from './AssetCardActions';
import { File, Asset } from '../../types';
import { entityHelpers } from '@contentful/field-editor-shared';
import { MissingEntityCard } from '../../components';

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
  markup: 'markup',
};

export interface WrappedAssetCardProps {
  asset: Asset;
  localeCode: string;
  defaultLocaleCode: string;
  getAssetUrl?: (assetId: string) => string;
  className?: string;
  isSelected?: boolean;
  isDisabled: boolean;
  onEdit?: () => void;
  onRemove?: () => void;
  size: 'default' | 'small';
  cardDragHandle?: React.ReactElement;
  isClickable: boolean;
}

const defaultProps = {
  isClickable: true,
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getFileType(file?: File): any {
  if (!file) {
    return 'archive';
  }

  const groupName: keyof typeof groupToIconMap = mimetype.getGroupLabel({
    type: file.contentType,
    fallbackFileName: file.fileName,
  });

  return groupToIconMap[groupName] || 'archive';
}

export const WrappedAssetCard = (props: WrappedAssetCardProps) => {
  const {
    className,
    onEdit,
    getAssetUrl,
    onRemove,
    size,
    isDisabled,
    isSelected,
    isClickable,
  } = props;

  const status = entityHelpers.getEntryStatus(props.asset.sys);

  if (status === 'deleted') {
    return (
      <MissingEntityCard
        entityType="Asset"
        asSquare
        isDisabled={props.isDisabled}
        onRemove={props.onRemove}
      />
    );
  }

  const entityTitle = entityHelpers.getAssetTitle({
    asset: props.asset,
    localeCode: props.localeCode,
    defaultLocaleCode: props.defaultLocaleCode,
    defaultTitle: 'Untitled',
  });

  const entityFile = props.asset.fields.file
    ? props.asset.fields.file[props.localeCode] || props.asset.fields.file[props.defaultLocaleCode]
    : undefined;

  return (
    <AssetCard
      type={getFileType(entityFile)}
      title={entityTitle}
      className={className}
      // @ts-ignore
      selected={isSelected}
      href={getAssetUrl ? getAssetUrl(props.asset.sys.id) : undefined}
      status={status}
      src={
        entityFile
          ? size === 'small'
            ? `${entityFile.url}?w=150&h=150&fit=thumb`
            : `${entityFile.url}?h=300`
          : ''
      }
      // @ts-ignore
      onClick={(e: React.MouseEvent<HTMLElement>) => {
        e.preventDefault();
        if (!isClickable) return;
        onEdit && onEdit();
      }}
      cardDragHandleComponent={props.cardDragHandle}
      withDragHandle={!!props.cardDragHandle}
      dropdownListElements={
        <React.Fragment>
          {renderActions({ entityFile, isDisabled: isDisabled, onEdit, onRemove })}
          {entityFile ? renderAssetInfo({ entityFile }) : <span />}
        </React.Fragment>
      }
      size={size}
    />
  );
};

WrappedAssetCard.defaultProps = defaultProps;
