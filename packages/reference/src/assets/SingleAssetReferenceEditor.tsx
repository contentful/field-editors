import * as React from 'react';
import { AssetReferenceValue } from '../types';
import { fromFieldValidations } from '../utils/fromFieldValidations';
import { FetchingWrappedAssetCard } from './WrappedAssetCard/FetchingWrappedAssetCard';
import { LinkAssetActions } from './LinkAssetActions';

import { ReferenceEditor, ReferenceEditorProps } from '../ReferenceEditor';

export function SingleAssetReferenceEditor(props: ReferenceEditorProps) {
  React.useEffect(() => {
    props.onAction && props.onAction({ type: 'rendered', entity: 'Asset' });
  }, []);

  return (
    <ReferenceEditor<AssetReferenceValue> {...props}>
      {({ value, setValue, disabled, externalReset }) => {
        if (!value) {
          const validations = fromFieldValidations(props.sdk.field.validations);
          return (
            <LinkAssetActions
              sdk={props.sdk}
              onAction={props.onAction}
              canCreateAsset={props.parameters.instance.canCreateEntity}
              multiple={false}
              validations={validations}
              disabled={disabled}
              onCreate={asset => {
                setValue({
                  sys: {
                    type: 'Link',
                    linkType: 'Asset',
                    id: asset.sys.id
                  }
                });
              }}
              onLink={([asset]) => {
                setValue({
                  sys: {
                    type: 'Link',
                    linkType: 'Asset',
                    id: asset.sys.id
                  }
                });
              }}
            />
          );
        }
        return (
          <FetchingWrappedAssetCard
            key={`single-asset-${externalReset}`}
            {...props}
            viewType="item"
            assetId={value.sys.id}
            disabled={disabled}
            onRemove={() => {
              setValue(null);
            }}
          />
        );
      }}
    </ReferenceEditor>
  );
}

SingleAssetReferenceEditor.defaultProps = {
  isInitiallyDisabled: true
};
