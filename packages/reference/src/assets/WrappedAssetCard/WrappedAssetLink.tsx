import * as React from 'react';

import { EntryCard } from '@contentful/f36-components';
import {
  entityHelpers,
  isValidImage,
  LocalePublishStatusMap,
  SpaceAPI,
} from '@contentful/field-editor-shared';
import { LocaleProps } from 'contentful-management';

import { AssetThumbnail, EntityStatusBadge, MissingAssetCard } from '../../components';
import { Asset, RenderDragFn } from '../../types';
import { renderActions, renderAssetInfo } from './AssetCardActions';

export interface WrappedAssetLinkProps {
  getEntityScheduledActions: SpaceAPI['getEntityScheduledActions'];
  asset: Asset;
  localeCode: string;
  defaultLocaleCode: string;
  href?: string;
  className?: string;
  isDisabled: boolean;
  onEdit?: () => void;
  onRemove?: () => void;
  renderDragHandle?: RenderDragFn;
  useLocalizedEntityStatus?: boolean;
  localesStatusMap?: LocalePublishStatusMap;
  activeLocales?: Pick<LocaleProps, 'code'>[];
  isClickable?: boolean;
}

export const WrappedAssetLink = (props: WrappedAssetLinkProps) => {
  const { className, href, onEdit, onRemove, isDisabled, isClickable = true } = props;

  const status = entityHelpers.getEntityStatus(
    props.asset.sys,
    props.useLocalizedEntityStatus ? props.localeCode : undefined,
  );

  if (status === 'deleted') {
    return <MissingAssetCard isDisabled={props.isDisabled} onRemove={props.onRemove} />;
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
    <EntryCard
      as={isClickable && href ? 'a' : 'article'}
      contentType="Asset"
      title={entityTitle}
      className={className}
      href={isClickable ? href : undefined}
      size="small"
      badge={
        <EntityStatusBadge
          getEntityScheduledActions={props.getEntityScheduledActions}
          entityType="Asset"
          status={status}
          useLocalizedEntityStatus={props.useLocalizedEntityStatus}
          entity={props.asset}
          localesStatusMap={props.localesStatusMap}
          activeLocales={props.activeLocales}
        />
      }
      thumbnailElement={
        entityFile && isValidImage(entityFile) ? <AssetThumbnail file={entityFile} /> : undefined
      }
      onClick={
        isClickable
          ? (e: React.MouseEvent<HTMLElement>) => {
              e.preventDefault();
              onEdit && onEdit();
            }
          : undefined
      }
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
      dragHandleRender={props.renderDragHandle}
      withDragHandle={!!props.renderDragHandle && !isDisabled}
      actions={[
        renderActions({ entityFile, isDisabled: isDisabled, onEdit, onRemove }),
        entityFile ? renderAssetInfo({ entityFile }) : null,
      ].filter((item) => item)}
    />
  );
};
