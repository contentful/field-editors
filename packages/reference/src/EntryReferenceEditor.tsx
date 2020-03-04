import * as React from 'react';
import { FieldAPI, FieldConnector } from '@contentful/field-editor-shared';
import { EntryCard } from '@contentful/forma-36-react-components';
import { ViewType, EntryReferenceValue, BaseExtensionSDK, Link } from './types';
import { LinkActions } from './LinkActions/LinkActions';
import { fromFieldValidations, ReferenceValidations } from './utils/fromFieldValidations';
import { WrappedEntryCard } from './WrappedEntryCard/WrappedEntryCard';
import { MissingEntityCard } from './MissingEntityCard/MissingEntityCard';
import { EntityProvider, useEntityStore } from './EntityStore/EntityStore';

export interface EntryReferenceEditorProps {
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
      canCreateEntry: boolean;
    };
  };
}

function SingleEntryReferenceEditor(
  props: EntryReferenceEditorProps & {
    value: EntryReferenceValue | null | undefined;
    disabled: boolean;
    setValue: (value: EntryReferenceValue | null | undefined) => void;
    validations: ReferenceValidations;
  }
) {
  const { value, baseSdk, validations, setValue, disabled } = props;
  const { loadEntry, entries, setEntry } = useEntityStore();

  React.useEffect(() => {
    if (value?.sys.id) {
      loadEntry(value.sys.id);
    }
  }, [value?.sys.id]);

  const allContentTypes = props.baseSdk.space.getCachedContentTypes();
  const allowedContentTypes = props.validations.contentTypes
    ? allContentTypes.filter(contentType => {
        return props.validations.contentTypes?.includes(contentType.sys.id);
      })
    : allContentTypes;

  const size = props.viewType === 'link' ? 'small' : 'default';

  const entry = value ? entries[value.sys.id] : undefined;

  return (
    <div>
      {value && entry === 'failed' && (
        <MissingEntityCard
          entityType="entry"
          disabled={props.disabled}
          onRemove={() => {
            props.setValue(null);
          }}
        />
      )}
      {value && entry === undefined && <EntryCard size={size} loading />}
      {value && entry !== 'failed' && entry !== undefined && (
        <WrappedEntryCard
          getAsset={props.baseSdk.space.getAsset}
          getEntryUrl={props.getEntryUrl}
          disabled={disabled}
          size={size}
          localeCode={props.field.locale}
          defaultLocaleCode={baseSdk.locales.default}
          allContentTypes={allContentTypes}
          entry={entry}
          onEdit={async () => {
            try {
              const { entity } = await baseSdk.navigator.openEntry(entry.sys.id, {
                slideIn: { waitForClose: true }
              });
              setEntry(entry.sys.id, entity);
            } catch (e) {
              baseSdk.notifier.error('Could not load the entry');
            }
          }}
          onRemove={() => {
            props.setValue(null);
          }}
        />
      )}
      {!value && (
        <LinkActions
          entityType="entry"
          multiple={false}
          disabled={props.disabled}
          canCreateEntity={
            allowedContentTypes.length > 0 && props.parameters.instance.canCreateEntry
          }
          contentTypes={allowedContentTypes}
          onCreate={async contentTypeId => {
            if (contentTypeId) {
              const { entity } = await baseSdk.navigator.openNewEntry(contentTypeId, {
                slideIn: { waitForClose: true }
              });
              if (!entity) {
                return;
              }
              setValue({
                sys: {
                  type: 'Link',
                  linkType: 'Entry',
                  id: entity.sys.id
                }
              });
            }
          }}
          onLinkExisting={async () => {
            const item = await baseSdk.dialogs.selectSingleEntry<Link>({
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
    <EntityProvider sdk={props.baseSdk}>
      <FieldConnector<EntryReferenceValue>
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
    </EntityProvider>
  );
}

EntryReferenceEditor.defaultProps = {
  isInitiallyDisabled: true
};
