import React from 'react';
import { AssetCard } from '@contentful/forma-36-react-components';
import { AssetCardActions } from './AssetCardActions';
import { File, Asset } from '../types';
import { entityHelpers } from '@contentful/field-editor-shared';
import { MissingEntityCard } from '../MissingEntityCard/MissingEntityCard';
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
  href?: string;
  className?: string;
  disabled: boolean;
  onEdit: () => void;
  onRemove: () => void;
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

export const FetchedWrappedAssetCard = (
  props: { asset?: Asset; localeCode: string; defaultLocaleCode: string } & Pick<
    WrappedAssetCardProps,
    'href' | 'size' | 'readOnly' | 'disabled' | 'onRemove' | 'onEdit'
  >
) => {
  if (!props.asset) {
    return <AssetCard size={props.size} isLoading title="" src="" href="" />;
  }

  const status = entityHelpers.getEntryStatus(props.asset.sys);

  if (status === 'deleted') {
    return (
      <MissingEntityCard entityType="asset" disabled={props.disabled} onRemove={props.onRemove} />
    );
  }

  const entityTitle = entityHelpers.getAssetTitle({
    asset: props.asset,
    localeCode: props.localeCode,
    defaultLocaleCode: props.defaultLocaleCode,
    defaultTitle: 'Untitled'
  });

  const entityFile =
    props.asset.fields.file[props.localeCode] || props.asset.fields.file[props.defaultLocaleCode];

  return (
    <WrappedAssetCard
      {...props}
      entityFile={entityFile}
      entityStatus={status}
      entityTitle={entityTitle}
    />
  );
};

export const WrappedAssetCard = (props: WrappedAssetCardProps) => {
  const { entityFile, entityTitle, className, href, entityStatus, onEdit, size, readOnly } = props;

  return (
    <AssetCard
      type={getFileType(entityFile)}
      title={entityTitle}
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
      onClick={onEdit}
      // cardDragHandleComponent={cardDragHandleComponent}
      // withDragHandle={!!cardDragHandleComponent}
      // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
      // @ts-ignore
      dropdownListElements={
        readOnly ? null : (
          <AssetCardActions
            entityFile={props.entityFile}
            isDisabled={props.disabled}
            onEdit={props.onEdit}
            onRemove={props.onRemove}
          />
        )
      }
      size={size}
    />
  );
};
