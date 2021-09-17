import * as React from 'react';
import {
  AssetCard,
  AssetType,
  DropdownList,
  DropdownListItem,
} from '@contentful/forma-36-react-components';
import { useEntities, MissingEntityCard } from '@contentful/field-editor-reference';
import { FieldExtensionSDK } from '@contentful/app-sdk';
import { entityHelpers, File, shortenStorageUnit } from '@contentful/field-editor-shared';
import mimetype from '@contentful/mimetype';
import { css } from 'emotion';
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

interface AssetDropdownMenuProps {
  onEdit?: () => void;
  onRemove?: () => void;
  isDisabled: boolean;
  entityFile: File;
}

function AssetDropdownMenu({ onEdit, onRemove, isDisabled, entityFile }: AssetDropdownMenuProps) {
  const { fileName, contentType: mimeType, details } = entityFile;
  const { size: fileSize, image } = details;

  function downloadAsset() {
    if (!entityFile) return;

    window.open(entityFile.url, '_blank', 'noopener,noreferrer');
  }

  return (
    <React.Fragment>
      <DropdownList>
        <DropdownListItem isTitle={true}>Actions</DropdownListItem>
        {onEdit && (
          <DropdownListItem onClick={onEdit} testId="edit">
            Edit
          </DropdownListItem>
        )}
        {entityFile && (
          <DropdownListItem onClick={downloadAsset} testId="card-action-download">
            Download
          </DropdownListItem>
        )}
        {onRemove && (
          <DropdownListItem onClick={onRemove} isDisabled={isDisabled} testId="delete">
            Remove
          </DropdownListItem>
        )}
      </DropdownList>

      <DropdownList border="top">
        <DropdownListItem isTitle={true}>File info</DropdownListItem>
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
    </React.Fragment>
  );
}

export function FetchingWrappedAssetCard(props: FetchingWrappedAssetCardProps) {
  const { getOrLoadAsset, assets } = useEntities();
  const asset = assets[props.assetId];
  const defaultLocaleCode = props.sdk.locales.default;
  const entityFile: File | undefined = asset?.fields.file
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
    return <AssetCard size="default" isLoading={true} title="" src="" href="" />;
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
      selected={props.isSelected}
      size="default"
      src={getAssetSrc()}
      type={getFileType()}
      status={status}
      statusIcon={<EntityStatusIcon entityType="Asset" entity={asset} />}
      className={styles.assetCard}
      dropdownListElements={
        entityFile && (
          <AssetDropdownMenu
            onEdit={props.onEdit}
            onRemove={props.onRemove}
            isDisabled={props.isDisabled}
            entityFile={entityFile}
          />
        )
      }
    />
  );
}
