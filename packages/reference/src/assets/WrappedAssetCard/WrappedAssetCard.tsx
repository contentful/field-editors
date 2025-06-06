import * as React from 'react';

import { SpaceAPI } from '@contentful/app-sdk';
import { AssetCard } from '@contentful/f36-components';
import { entityHelpers, LocalePublishStatusMap } from '@contentful/field-editor-shared';
// @ts-expect-error mimetype is not typed
import mimetype from '@contentful/mimetype';
import { LocaleProps } from 'contentful-management';

import { EntityStatusBadge, MissingAssetCard } from '../../components';
import { Asset, File, RenderDragFn } from '../../types';
import { renderActions, renderAssetInfo } from './AssetCardActions';

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
  getEntityScheduledActions: SpaceAPI['getEntityScheduledActions'];
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
  renderDragHandle?: RenderDragFn;
  isClickable?: boolean;
  useLocalizedEntityStatus?: boolean;
  localesStatusMap?: LocalePublishStatusMap;
  activeLocales?: Pick<LocaleProps, 'code'>[];
}

const defaultProps = {
  isClickable: true,
};

// eslint-disable-next-line -- TODO: describe this disable  @typescript-eslint/no-explicit-any
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

export const WrappedAssetCard = ({
  asset,
  className,
  size,
  localeCode,
  defaultLocaleCode,
  activeLocales,
  localesStatusMap,
  isDisabled,
  isSelected,
  isClickable,
  useLocalizedEntityStatus,
  renderDragHandle,
  getEntityScheduledActions,
  onEdit,
  getAssetUrl,
  onRemove,
}: WrappedAssetCardProps) => {
  const status = entityHelpers.getEntityStatus(
    asset.sys,
    useLocalizedEntityStatus ? localeCode : undefined,
  );

  if (status === 'deleted') {
    return <MissingAssetCard asSquare isDisabled={isDisabled} onRemove={onRemove} />;
  }

  const entityTitle = entityHelpers.getAssetTitle({
    asset: asset,
    localeCode: localeCode,
    defaultLocaleCode: defaultLocaleCode,
    defaultTitle: 'Untitled',
  });

  const entityFile = asset.fields.file
    ? asset.fields.file[localeCode] || asset.fields.file[defaultLocaleCode]
    : undefined;

  const href = getAssetUrl ? getAssetUrl(asset.sys.id) : undefined;

  return (
    <AssetCard
      as={isClickable && href ? 'a' : 'article'}
      type={getFileType(entityFile)}
      title={entityTitle}
      className={className}
      isSelected={isSelected}
      href={isClickable ? href : undefined}
      badge={
        <EntityStatusBadge
          getEntityScheduledActions={getEntityScheduledActions}
          entityType="Asset"
          status={status}
          useLocalizedEntityStatus={useLocalizedEntityStatus}
          entity={asset}
          localesStatusMap={localesStatusMap}
          activeLocales={activeLocales}
        />
      }
      src={
        entityFile && entityFile.url
          ? size === 'small'
            ? `${entityFile.url}?w=150&h=150&fit=thumb`
            : `${entityFile.url}?h=300`
          : ''
      }
      onClick={
        // Providing an onClick handler messes up with some rich text
        // features e.g. pressing ENTER on a card to add a new paragraph
        // underneath. It's crucial not to pass a custom handler when
        // isClickable is disabled which in the case of RT it's.
        isClickable
          ? (e: React.MouseEvent<HTMLElement>) => {
              e.preventDefault();
              onEdit && onEdit();
            }
          : undefined
      }
      /* todo - remove this when onKeyDown is allowed as a prop for BaseCard in forma 36
      // @ts-expect-error */
      onKeyDown={
        isClickable
          ? (e: React.KeyboardEvent<HTMLElement>) => {
              if (e.key === 'Enter' && onEdit) {
                e.preventDefault();
                onEdit();
              }
            }
          : undefined
      }
      dragHandleRender={renderDragHandle}
      withDragHandle={!!renderDragHandle && !isDisabled}
      draggable={!!renderDragHandle && !isDisabled}
      actions={[
        ...renderActions({ entityFile, isDisabled: isDisabled, onEdit, onRemove }),
        ...(entityFile ? renderAssetInfo({ entityFile }) : []),
      ].filter((item) => item)}
      size={size}
    />
  );
};

WrappedAssetCard.defaultProps = defaultProps;
