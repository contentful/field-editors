import * as React from 'react';
import { FieldAPI, FieldConnector } from '@contentful/field-editor-shared';
import { AssetCard } from '@contentful/forma-36-react-components';
import { ViewType, AssetReferenceValue, BaseExtensionSDK, Link } from './types';
import { LinkActions } from './LinkActions/LinkActions';
import { MissingEntityCard } from './MissingEntityCard/MissingEntityCard';
import { FetchedWrappedAssetCard } from './WrappedAssetCard/WrappedAssetCard';
import { AssetsProvider, useAssetsStore } from './EntityStore/EntityStore';

export interface AssetReferenceEditorProps {
  /**
   * is the field disabled initially
   */
  isInitiallyDisabled: boolean;

  baseSdk: BaseExtensionSDK;

  field: FieldAPI;

  viewType: ViewType;

  getAssetUrl?: (assetId: string) => string;

  parameters: {
    instance: {
      canCreateAsset: boolean;
    };
  };
}

type SingleAssetReferenceEditorProps = AssetReferenceEditorProps & {
  value: AssetReferenceValue | null | undefined;
  disabled: boolean;
  setValue: (value: AssetReferenceValue | null | undefined) => void;
};

function LinkSingleAssetReference(props: SingleAssetReferenceEditorProps) {
  const { disabled, baseSdk, setValue } = props;
  // todo: need to analyze validations and apply it
  return (
    <LinkActions
      entityType="asset"
      multiple={false}
      contentTypes={[]}
      disabled={disabled}
      canCreateEntity={props.parameters.instance.canCreateAsset}
      onCreate={async () => {
        const { entity } = await baseSdk.navigator.openNewAsset({
          slideIn: { waitForClose: true }
        });
        if (!entity) {
          return;
        }
        setValue({
          sys: {
            type: 'Link',
            linkType: 'Asset',
            id: entity.sys.id
          }
        });
      }}
      onLinkExisting={async () => {
        const item = await baseSdk.dialogs.selectSingleAsset<Link>({
          locale: props.field.locale
        });
        if (!item) {
          return;
        }
        setValue({
          sys: {
            type: 'Link',
            linkType: 'Asset',
            id: item.sys.id
          }
        });
      }}
    />
  );
}

function SingleAssetReferenceEditor(props: SingleAssetReferenceEditorProps) {
  const { value, baseSdk, disabled } = props;

  const { loadAsset, assets } = useAssetsStore();

  React.useEffect(() => {
    if (value) {
      loadAsset(value.sys.id);
    }
  }, [value?.sys.id]);

  React.useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore
    const unsubscribe = baseSdk.navigator.onSlideInNavigation(
      // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
      // @ts-ignore
      ({ oldSlideLevel, newSlideLevel }) => {
        if (value?.sys.id) {
          if (oldSlideLevel > newSlideLevel) {
            loadAsset(value.sys.id);
          }
        }
      }
    );
    return () => {
      unsubscribe();
    };
  }, [baseSdk]);

  if (!value) {
    return <LinkSingleAssetReference {...props} />;
  }

  const asset = assets[value.sys.id];

  if (asset === 'failed') {
    return (
      <MissingEntityCard
        entityType="asset"
        disabled={props.disabled}
        onRemove={() => {
          props.setValue(null);
        }}
      />
    );
  }

  if (asset === undefined) {
    return <AssetCard size="default" isLoading title="" src="" href="" />;
  }

  return (
    <FetchedWrappedAssetCard
      disabled={disabled}
      size="default"
      readOnly={false}
      href={props.getAssetUrl ? props.getAssetUrl(value.sys.id) : ''}
      localeCode={props.field.locale}
      defaultLocaleCode={props.baseSdk.locales.default}
      asset={asset}
      onEdit={async () => {
        try {
          await baseSdk.navigator.openAsset(value.sys.id, {
            slideIn: { waitForClose: true }
          });
        } catch (e) {
          baseSdk.notifier.error('Could not load the asset');
        }
      }}
      onRemove={() => {
        props.setValue(null);
      }}
    />
  );
}

export function AssetReferenceEditor(props: AssetReferenceEditorProps) {
  const { field } = props;

  return (
    <AssetsProvider sdk={props.baseSdk}>
      <FieldConnector<AssetReferenceValue>
        throttle={0}
        field={field}
        isInitiallyDisabled={props.isInitiallyDisabled}>
        {({ value, setValue, disabled, externalReset }) => {
          return (
            <SingleAssetReferenceEditor
              key={`single-asset-${externalReset}`}
              {...props}
              disabled={disabled}
              value={value}
              setValue={setValue}
            />
          );
        }}
      </FieldConnector>
    </AssetsProvider>
  );
}

AssetReferenceEditor.defaultProps = {
  isInitiallyDisabled: true
};
