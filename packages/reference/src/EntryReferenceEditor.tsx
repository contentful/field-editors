import * as React from 'react';
import { FieldAPI, FieldConnector } from '@contentful/field-editor-shared';
// todo: import from shared
import { BaseExtensionSDK, ContentType } from 'contentful-ui-extensions-sdk';
import { ViewType, SingleReferenceValue } from './types';
import { LinkActions } from './LinkActions/LinkActions';
import { fromFieldValidations, ReferenceValidations } from './utils/fromFieldValidations';
import { WrappedEntryCard } from './WrappedEntryCard/WrappedEntryCard';

export interface EntryReferenceEditorProps {
  /**
   * is the field disabled initially
   */
  isInitiallyDisabled: boolean;

  baseSdk: BaseExtensionSDK;

  field: FieldAPI;

  viewType: ViewType;
}

function SingleEntryReferenceEditor(
  props: EntryReferenceEditorProps & {
    value: SingleReferenceValue | null | undefined;
    disabled: boolean;
    setValue: (value: SingleReferenceValue | null | undefined) => void;
    validations: ReferenceValidations;
  }
) {
  const { value, baseSdk, validations, setValue, disabled } = props;

  const [entry, setEntry] = React.useState<any>(null);
  const [error, setError] = React.useState<any>(null);
  const [allContentTypes, setAllContentTypes] = React.useState<Array<ContentType> | null>(null);

  React.useEffect(() => {
    baseSdk.space.getContentTypes().then(data => {
      setAllContentTypes(data.items as any);
    });
  }, []);

  React.useEffect(() => {
    if (value) {
      baseSdk.space
        .getEntry(value.sys.id)
        .then(entry => {
          setEntry(entry);
          setError(false);
        })
        .catch(() => {
          setError(true);
          setEntry(null);
        });
    } else {
      setEntry(null);
      setError(null);
    }
  }, [value]);

  return (
    <div>
      {value && allContentTypes && !error && (
        <WrappedEntryCard
          disabled={disabled}
          viewType={props.viewType}
          localeCode={props.field.locale}
          defaultLocaleCode={props.baseSdk.locales.default}
          allContentTypes={allContentTypes}
          entry={entry}
          onEdit={async () => {
            const { entity } = await baseSdk.navigator.openEntry(value.sys.id, {
              slideIn: { waitForClose: true }
            });
            setEntry(entity);
          }}
          onRemove={() => {
            props.setValue(null);
          }}
        />
      )}
      {!value && !error && (
        <LinkActions
          entityType="entry"
          multiple={false}
          canCreateEntity={true}
          onCreate={() => {
            console.log('onCreate');
          }}
          onLinkExisting={async () => {
            const item = await baseSdk.dialogs.selectSingleEntry({
              locale: props.field.locale,
              contentTypes: validations.contentTypes
            });
            if (!item) {
              return;
            }
            setValue({
              sys: {
                type: 'Link',
                linkType: 'Entry',
                id: item.sys.id
              }
            });
          }}
        />
      )}
    </div>
  );
}

export function EntryReferenceEditor(props: EntryReferenceEditorProps) {
  const { field } = props;

  const validations = fromFieldValidations(field.validations);

  return (
    <FieldConnector<SingleReferenceValue>
      throttle={0}
      field={field}
      isInitiallyDisabled={props.isInitiallyDisabled}>
      {({ value, setValue, disabled, externalReset }) => {
        return (
          <SingleEntryReferenceEditor
            key={`single-reference-${externalReset}`}
            {...props}
            disabled={disabled}
            validations={validations}
            value={value}
            setValue={setValue}
          />
        );
      }}
    </FieldConnector>
  );
}

EntryReferenceEditor.defaultProps = {
  isInitiallyDisabled: true
};
