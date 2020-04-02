import * as React from 'react';
import { AssetCard } from '@contentful/forma-36-react-components';
import { FieldExtensionSDK, Action } from '../../types';
import { MissingEntityCard } from '../../components';
import { WrappedAssetCard } from './WrappedAssetCard';
import { useEntities } from '../../EntityStore';

type FetchingWrappedAssetCardProps = {
  assetId: string;
  disabled: boolean;
  sdk: FieldExtensionSDK;
  viewType: 'link' | 'item' | 'small_item';
  onRemove: () => void;
  getAssetUrl?: (assetId: string) => string;
  onAction?: (action: Action) => void;
};

export function FetchingWrappedAssetCard(props: FetchingWrappedAssetCardProps) {
  const { assetId, sdk, disabled } = props;

  const { loadAsset, assets } = useEntities();

  React.useEffect(() => {
    loadAsset(assetId);
  }, [assetId]);

  const asset = assets[assetId];

  const size = props.viewType === 'item' ? 'default' : 'small';

  if (asset === 'failed') {
    return (
      <MissingEntityCard entityType="asset" disabled={props.disabled} onRemove={props.onRemove} />
    );
  }

  if (asset === undefined) {
    return <AssetCard size={size} isLoading title="" src="" href="" />;
  }

  return (
    <WrappedAssetCard
      disabled={disabled}
      size={size}
      readOnly={false}
      href={props.getAssetUrl ? props.getAssetUrl(assetId) : ''}
      localeCode={props.sdk.field.locale}
      defaultLocaleCode={props.sdk.locales.default}
      asset={asset}
      onEdit={async () => {
        const { slide } = await sdk.navigator.openAsset(assetId, { slideIn: true });
        props.onAction &&
          props.onAction({
            entity: 'Asset',
            type: 'edit',
            id: assetId,
            contentTypeId: '',
            slide
          });
      }}
      onRemove={() => {
        props.onRemove();
        props.onAction &&
          props.onAction({ entity: 'Asset', type: 'delete', id: assetId, contentTypeId: '' });
      }}
    />
  );
}
