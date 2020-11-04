import * as React from 'react';
import { AssetCard, EntryCard } from '@contentful/forma-36-react-components';
import { FieldExtensionSDK, Action, Asset, ViewType } from '../../types';
import { MissingEntityCard } from '../../components';
import { WrappedAssetCard } from './WrappedAssetCard';
import { WrappedAssetLink } from './WrappedAssetLink';
import { useEntities } from '../../common/EntityStore';

type FetchingWrappedAssetCardProps = {
  assetId: string;
  isDisabled: boolean;
  sdk: FieldExtensionSDK;
  viewType: ViewType | 'big_card';
  onRemove: () => void;
  getEntityUrl?: (id: string) => string;
  onAction?: (action: Action) => void;
  cardDragHandle?: React.ReactElement;
};

export function FetchingWrappedAssetCard(props: FetchingWrappedAssetCardProps) {
  const { loadAsset, assets } = useEntities();

  React.useEffect(() => {
    loadAsset(props.assetId);
  }, [props.assetId]);

  const asset = assets[props.assetId];
  const entityKey =
    asset === 'failed'
      ? 'failed'
      : asset === undefined
      ? 'undefined'
      : `:${asset.sys.id}:${asset.sys.version}`;

  React.useEffect(() => {
    if (asset) {
      props.onAction && props.onAction({ type: 'rendered', entity: 'Asset' });
    }
  }, [asset]);

  const onRemoveAsset = () => {
    props.onRemove();
    props.onAction &&
      props.onAction({ entity: 'Asset', type: 'delete', id: props.assetId, contentTypeId: '' });
  };

  return React.useMemo(() => {
    if (asset === 'failed') {
      return (
        <MissingEntityCard
          entityType="Asset"
          asSquare={props.viewType !== 'link'}
          isDisabled={props.isDisabled}
          onRemove={onRemoveAsset}
        />
      );
    }

    const commonProps = {
      isDisabled: props.isDisabled,
      href: props.getEntityUrl ? props.getEntityUrl(props.assetId) : '',
      localeCode: props.sdk.field.locale,
      defaultLocaleCode: props.sdk.locales.default,
      asset: asset as Asset,
      onEdit: async () => {
        const { slide } = await props.sdk.navigator.openAsset(props.assetId, { slideIn: true });
        props.onAction &&
          props.onAction({
            entity: 'Asset',
            type: 'edit',
            id: props.assetId,
            contentTypeId: '',
            slide,
          });
      },
      cardDragHandle: props.cardDragHandle,
      onRemove: onRemoveAsset,
    };

    if (props.viewType === 'link') {
      if (asset === undefined) {
        return <EntryCard size="small" loading />;
      }
      return <WrappedAssetLink {...commonProps} />;
    }

    const size = props.viewType === 'big_card' ? 'default' : 'small';

    if (asset === undefined) {
      return <AssetCard size={size} isLoading title="" src="" href="" />;
    }

    return <WrappedAssetCard size={size} {...commonProps} />;
  }, [props, entityKey]);
}
