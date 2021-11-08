import * as React from 'react';
import { AssetCard, AssetType, Menu, Text } from '@contentful/f36-components';
import { useEntities, MissingEntityCard } from '@contentful/field-editor-reference';

import { FieldExtensionSDK } from '@contentful/app-sdk';
import { entityHelpers, File, shortenStorageUnit } from '@contentful/field-editor-shared';
import mimetype from '@contentful/mimetype';
import { css } from 'emotion';
import get from 'lodash/get';
import { EntityStatusIcon } from './EntityStatusIcon';

const styles = {
  assetCard: css({ cursor: 'pointer' }),
  cardDropdown: css({
    width: '300px',
  }),
  truncated: css({
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
  }),
};
interface FetchingWrappedAssetCardProps {
  assetId: string;
  isDisabled: boolean;
  isSelected: boolean;
  locale: string;
  onEdit?: () => void;
  onRemove?: () => unknown;
  sdk: FieldExtensionSDK;
}

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
        testId="card-action-download">
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

export function FetchingWrappedAssetCard(props: FetchingWrappedAssetCardProps) {
  const { getOrLoadAsset, assets } = useEntities();
  const asset = assets[props.assetId];
  const defaultLocaleCode = props.sdk.locales.default;
  const entityFile: File | undefined = asset?.fields?.file
    ? asset.fields.file[props.locale] || asset.fields.file[defaultLocaleCode]
    : undefined;

  React.useEffect(() => {
    getOrLoadAsset(props.assetId);
  }, [props.assetId]); // eslint-disable-line

  function getAssetSrc() {
    if (!entityFile?.url) return '';

    return `${entityFile.url}?h=300`;
  }

  function getFileType(): AssetType {
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
    const archive = groupToIconMap['archive'] as AssetType;

    if (!entityFile) {
      return archive;
    }

    const groupName: keyof typeof groupToIconMap = mimetype.getGroupLabel({
      type: entityFile.contentType,
      fallbackFileName: entityFile.fileName,
    });

    return (groupToIconMap[groupName] as AssetType) || archive;
  }

  if (asset === undefined) {
    return <AssetCard size="small" isLoading />;
  }

  if (asset === 'failed') {
    return (
      <MissingEntityCard
        entityType="Asset"
        isDisabled={props.isDisabled}
        onRemove={props.onRemove}
      />
    );
  }

  const status = asset ? entityHelpers.getEntryStatus(asset.sys) : undefined;
  if (status === 'deleted') {
    return (
      <MissingEntityCard
        entityType="Asset"
        asSquare={true}
        isDisabled={props.isDisabled}
        onRemove={props.onRemove}
      />
    );
  }

  const entityTitle = entityHelpers.getAssetTitle({
    asset,
    localeCode: props.locale,
    defaultLocaleCode,
    defaultTitle: 'Untitled',
  });

  return (
    <AssetCard
      title={entityTitle}
      isSelected={props.isSelected}
      size="small"
      src={getAssetSrc()}
      type={getFileType()}
      status={status}
      icon={<EntityStatusIcon entityType="Asset" entity={asset} />}
      withDragHandle={false}
      className={styles.assetCard}
      actions={[
        renderActions({
          entityFile,
          isDisabled: props.isDisabled,
          onEdit: props.onEdit,
          onRemove: props.onRemove,
        }),
        entityFile ? renderAssetInfo({ entityFile }) : null,
      ].filter((item) => item)}
    />
  );
}
