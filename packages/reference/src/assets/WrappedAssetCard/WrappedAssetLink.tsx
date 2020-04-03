import React from 'react';
import { EntryCard } from '@contentful/forma-36-react-components';
import { renderActions, renderAssetInfo } from './AssetCardActions';
import { Asset } from '../../types';
import { entityHelpers } from '@contentful/field-editor-shared';
import { MissingEntityCard } from '../../components';

export interface WrappedAssetLinkProps {
  asset: Asset;
  localeCode: string;
  defaultLocaleCode: string;
  href?: string;
  className?: string;
  disabled: boolean;
  onEdit: () => void;
  onRemove: () => void;
  cardDragHandle?: React.ReactElement;
}

export const WrappedAssetLink = (props: WrappedAssetLinkProps) => {
  const { className, href, onEdit, onRemove, disabled } = props;

  const status = entityHelpers.getEntryStatus(props.asset.sys);

  if (status === 'deleted') {
    return (
      <MissingEntityCard entityType="Asset" disabled={props.disabled} onRemove={props.onRemove} />
    );
  }

  const entityTitle = entityHelpers.getAssetTitle({
    asset: props.asset,
    localeCode: props.localeCode,
    defaultLocaleCode: props.defaultLocaleCode,
    defaultTitle: 'Untitled'
  });

  const entityFile = props.asset.fields.file
    ? props.asset.fields.file[props.localeCode] || props.asset.fields.file[props.defaultLocaleCode]
    : undefined;

  return (
    <EntryCard
      contentType="Asset"
      title={entityTitle}
      className={className}
      href={href}
      size="small"
      status={status}
      // @ts-ignore
      onClick={(e: React.MouseEvent<HTMLElement>) => {
        e.preventDefault();
        onEdit();
      }}
      cardDragHandleComponent={props.cardDragHandle}
      withDragHandle={!!props.cardDragHandle}
      dropdownListElements={
        <React.Fragment>
          {renderActions({ entityFile, isDisabled: disabled, onEdit, onRemove })}
          {entityFile ? renderAssetInfo({ entityFile }) : <span />}
        </React.Fragment>
      }
    />
  );
};
