import * as React from 'react';
import { FieldAPI, FieldConnector } from '@contentful/field-editor-shared';
import { ViewType, SingleAssetReferenceValue, BaseExtensionSDK, Asset, Link } from './types';
import { LinkActions } from './LinkActions/LinkActions';
import { MissingEntityCard } from './MissingEntityCard/MissingEntityCard';

export interface AssetReferenceEditorProps {
  /**
   * is the field disabled initially
   */
  isInitiallyDisabled: boolean;

  baseSdk: BaseExtensionSDK;

  field: FieldAPI;

  viewType: ViewType;

  getEntryUrl?: (entryId: string) => string;

  parameters: {
    instance: {
      canCreateAsset: boolean;
    };
  };
}

function SingleAssetReferenceEditor(
  props: AssetReferenceEditorProps & {
    value: SingleAssetReferenceValue | null | undefined;
    disabled: boolean;
    setValue: (value: SingleAssetReferenceValue | null | undefined) => void;
  }
) {
  const { value, baseSdk, setValue, disabled } = props;

  const [asset, setAsset] = React.useState<Asset | undefined>(undefined);
  const [error, setError] = React.useState<boolean>(false);

  React.useEffect(() => {
    if (value) {
      baseSdk.space
        .getAsset<Asset>(value.sys.id)
        .then(asset => {
          setAsset(asset);
          setError(false);
        })
        .catch(() => {
          setError(true);
          setAsset(undefined);
        });
    } else {
      setAsset(undefined);
      setError(false);
    }
  }, [value]);

  if (error) {
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

  console.log(asset);

  return (
    <div>
      {value && (
        <button
          onClick={() => {
            props.setValue(null);
          }}>
          remove
        </button>
        // <WrappedEntryCard
        //   getAsset={props.baseSdk.space.getAsset}
        //   getEntryUrl={props.getEntryUrl}
        //   disabled={disabled}
        //   viewType={props.viewType}
        //   localeCode={props.field.locale}
        //   defaultLocaleCode={props.baseSdk.locales.default}
        //   allContentTypes={allContentTypes}
        //   entry={entry}
        //   onEdit={async () => {
        //     const { entity } = await baseSdk.navigator.openEntry(value.sys.id, {
        //       slideIn: { waitForClose: true }
        //     });
        //     setEntry(entity);
        //   }}
        //   onRemove={() => {
        //     props.setValue(null);
        //   }}
        // />
      )}
      {!value && (
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
      )}
    </div>
  );
}

export function AssetReferenceEditor(props: AssetReferenceEditorProps) {
  const { field } = props;

  return (
    <FieldConnector<SingleAssetReferenceValue>
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
  );
}

AssetReferenceEditor.defaultProps = {
  isInitiallyDisabled: true
};
