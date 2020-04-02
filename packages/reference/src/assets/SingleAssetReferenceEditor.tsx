import * as React from 'react';
import { AssetReferenceValue } from '../types';
import { fromFieldValidations } from '../utils/fromFieldValidations';
import { FetchingWrappedAssetCard } from './WrappedAssetCard/FetchingWrappedAssetCard';
import { LinkEntityActions } from '../components';

import { ReferenceEditor, ReferenceEditorProps } from '../ReferenceEditor';

export function SingleAssetReferenceEditor(props: ReferenceEditorProps) {
  const allContentTypes = props.sdk.space.getCachedContentTypes();

  React.useEffect(() => {
    props.onAction && props.onAction({ type: 'rendered', entity: 'Asset' });
  }, []);

  return (
    <ReferenceEditor<AssetReferenceValue> {...props}>
      {({ value, setValue, disabled, externalReset }) => {
        if (!value) {
          const validations = fromFieldValidations(props.sdk.field.validations);
          return (
            <LinkEntityActions
              sdk={props.sdk}
              allContentTypes={allContentTypes}
              entityType="Asset"
              onAction={props.onAction}
              canCreateEntity={props.parameters.instance.canCreateEntity}
              multiple={false}
              validations={validations}
              disabled={disabled}
              onCreate={id => {
                setValue({
                  sys: {
                    type: 'Link',
                    linkType: 'Asset',
                    id
                  }
                });
              }}
              onLink={([id]) => {
                setValue({
                  sys: {
                    type: 'Link',
                    linkType: 'Asset',
                    id
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
