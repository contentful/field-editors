import * as React from 'react';

import { EntryCard } from '@contentful/f36-components';
import { entityHelpers, isValidImage, SpaceAPI } from '@contentful/field-editor-shared';

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
  onEdit: () => void;
  onRemove: () => void;
  renderDragHandle?: RenderDragFn;
  useLocalizedEntityStatus?: boolean;
}

export const WrappedAssetLink = (props: WrappedAssetLinkProps) => {
  const { className, href, onEdit, onRemove, isDisabled } = props;

  const status = entityHelpers.getEntityStatus(
    props.asset.sys,
    props.useLocalizedEntityStatus ? props.localeCode : undefined
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
      as={href ? 'a' : 'article'}
      contentType="Asset"
      title={entityTitle}
      className={className}
      href={href}
      size="small"
      badge={
        <EntityStatusBadge
          getEntityScheduledActions={props.getEntityScheduledActions}
          entityType="Asset"
          entityId={props.asset.sys.id}
          status={status}
        />
      }
      thumbnailElement={
        entityFile && isValidImage(entityFile) ? <AssetThumbnail file={entityFile} /> : undefined
      }
      onClick={(e: React.MouseEvent<HTMLElement>) => {
        e.preventDefault();
        onEdit();
      }}
      onKeyDown={(e: React.KeyboardEvent<HTMLElement>) => {
        if (e.key === 'Enter' && onEdit) {
          e.preventDefault();
          onEdit();
        }
      }}
      dragHandleRender={props.renderDragHandle}
      withDragHandle={!!props.renderDragHandle}
      actions={[
        renderActions({ entityFile, isDisabled: isDisabled, onEdit, onRemove }),
        entityFile ? renderAssetInfo({ entityFile }) : null,
      ].filter((item) => item)}
    />
  );
};
