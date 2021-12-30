import * as React from 'react';

import { AssetCard, EntryCard } from '@contentful/f36-components';

import {
  CustomEntityCardProps,
  CustomCardRenderer,
  RenderCustomMissingEntityCard,
} from '../../common/customCardTypes';
import { useEntities } from '../../common/EntityStore';
import { LinkActionsProps, MissingEntityCard } from '../../components';
import { Action, Asset, FieldExtensionSDK, ViewType, RenderDragFn } from '../../types';
import { WrappedAssetCard, WrappedAssetCardProps } from './WrappedAssetCard';
import { WrappedAssetLink } from './WrappedAssetLink';

type FetchingWrappedAssetCardProps = {
  assetId: string;
  isDisabled: boolean;
  sdk: FieldExtensionSDK;
  viewType: ViewType | 'big_card';
  onRemove: () => void;
  getEntityUrl?: (id: string) => string;
  onAction?: (action: Action) => void;
  renderDragHandle?: RenderDragFn;
  renderCustomCard?: CustomCardRenderer;
  renderCustomMissingEntityCard?: RenderCustomMissingEntityCard;
};

export function FetchingWrappedAssetCard(props: FetchingWrappedAssetCardProps) {
  const { getOrLoadAsset, loadEntityScheduledActions, assets } = useEntities();

  React.useEffect(() => {
    getOrLoadAsset(props.assetId);
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

  const onEdit = async () => {
    const { slide } = await props.sdk.navigator.openAsset(props.assetId, { slideIn: true });
    props.onAction &&
      props.onAction({
        entity: 'Asset',
        type: 'edit',
        id: props.assetId,
        contentTypeId: '',
        slide,
      });
  };

  const onRemove = () => {
    props.onRemove();
    props.onAction &&
      props.onAction({ entity: 'Asset', type: 'delete', id: props.assetId, contentTypeId: '' });
  };

  return React.useMemo(() => {
    if (asset === 'failed') {
      const card = (
        <MissingEntityCard
          entityType="Asset"
          asSquare={props.viewType !== 'link'}
          isDisabled={props.isDisabled}
          onRemove={onRemove}
        />
      );
      if (props.renderCustomMissingEntityCard) {
        return props.renderCustomMissingEntityCard({
          defaultCard: card,
          entity: {
            id: props.assetId,
            type: 'Asset',
          },
        });
      }
      return card;
    }

    const { getEntityUrl, sdk } = props;
    const size = props.viewType === 'big_card' ? 'default' : 'small';
    const commonProps = {
      asset: asset as Asset,
      entityUrl: getEntityUrl && getEntityUrl(props.assetId),
      size: size as 'default' | 'small',
      isDisabled: props.isDisabled,
      localeCode: props.sdk.field.locale,
      defaultLocaleCode: props.sdk.locales.default,
      renderDragHandle: props.renderDragHandle,
      onEdit,
      onRemove,
    };

    if (props.viewType === 'link') {
      if (asset === undefined) {
        return <EntryCard size="small" isLoading />;
      }
      return (
        <WrappedAssetLink
          {...commonProps}
          href={commonProps.entityUrl}
          getEntityScheduledActions={sdk.space.getEntityScheduledActions}
        />
      );
    }

    if (asset === undefined) {
      return <AssetCard size={size} isLoading />;
    }

    function renderDefaultCard(props?: CustomEntityCardProps) {
      // isClickable has a default value, so omit it from the props
      const builtinCardProps: Omit<WrappedAssetCardProps, 'isClickable'> = {
        ...commonProps,
        ...props,
        getEntityScheduledActions: loadEntityScheduledActions,
        asset: (props?.entity as Asset) || commonProps.asset,
        getAssetUrl: getEntityUrl,
      };

      return <WrappedAssetCard {...builtinCardProps} />;
    }

    if (props.renderCustomCard) {
      const customProps: CustomEntityCardProps = {
        ...commonProps,
        entity: commonProps.asset,
      };

      // LinkActionsProps are injected higher SingleReferenceEditor/MultipleReferenceEditor
      const renderedCustomCard = props.renderCustomCard(
        customProps,
        {} as LinkActionsProps,
        renderDefaultCard
      );
      // Only `false` indicates to render the original card. E.g. `null` would result in no card.
      if (renderedCustomCard !== false) {
        return renderedCustomCard;
      }
    }

    return renderDefaultCard();
  }, [props, entityKey]);
}
