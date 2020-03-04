import * as React from 'react';
import { FieldAPI, FieldConnector } from '@contentful/field-editor-shared';
import { EntryCard } from '@contentful/forma-36-react-components';
import { ViewType, EntryReferenceValue, BaseExtensionSDK, Link, ContentType } from './types';
import { LinkActions } from './LinkActions/LinkActions';
import { fromFieldValidations, ReferenceValidations } from './utils/fromFieldValidations';
import { WrappedEntryCard } from './WrappedEntryCard/WrappedEntryCard';
import { MissingEntityCard } from './MissingEntityCard/MissingEntityCard';
import { EntriesProvider, useEntriesStore } from './EntityStore/EntityStore';

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

export type SingleEntryReferenceEditorProps = EntryReferenceEditorProps & {
  value: EntryReferenceValue | null | undefined;
  allContentTypes: ContentType[];
  disabled: boolean;
  setValue: (value: EntryReferenceValue | null | undefined) => void;
  validations: ReferenceValidations;
};

function LinkSingleEntryReference(props: SingleEntryReferenceEditorProps) {
  const { baseSdk, validations, setValue } = props;

  const allowedContentTypes = props.validations.contentTypes
    ? props.allContentTypes.filter(contentType => {
        return props.validations.contentTypes?.includes(contentType.sys.id);
      })
    : props.allContentTypes;

  const onCreate = React.useCallback(async (contentTypeId?: string) => {
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
  }, []);

  const onLinkExisting = React.useCallback(async () => {
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
  }, []);

  return (
    <LinkActions
      entityType="entry"
      multiple={false}
      disabled={props.disabled}
      canCreateEntity={allowedContentTypes.length > 0 && props.parameters.instance.canCreateEntry}
      contentTypes={allowedContentTypes}
      onCreate={onCreate}
      onLinkExisting={onLinkExisting}
    />
  );
}

function SingleEntryReferenceEditor(props: SingleEntryReferenceEditorProps) {
  const { value, baseSdk, disabled, setValue } = props;
  const { loadEntry, entries, setEntry } = useEntriesStore();

  React.useEffect(() => {
    if (value?.sys.id) {
      loadEntry(value.sys.id);
    }
  }, [value?.sys.id]);

  const size = props.viewType === 'link' ? 'small' : 'default';

  if (!value) {
    return <LinkSingleEntryReference {...props} />;
  }

  const entry = entries[value.sys.id];

  if (entry === 'failed') {
    return (
      <MissingEntityCard
        entityType="entry"
        disabled={props.disabled}
        onRemove={() => {
          setValue(null);
        }}
      />
    );
  }

  if (entry === undefined) {
    return <EntryCard size={size} loading />;
  }

  return (
    <WrappedEntryCard
      getAsset={props.baseSdk.space.getAsset}
      getEntryUrl={props.getEntryUrl}
      disabled={disabled}
      size={size}
      localeCode={props.field.locale}
      defaultLocaleCode={baseSdk.locales.default}
      allContentTypes={props.allContentTypes}
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
  );
}

export function EntryReferenceEditor(props: EntryReferenceEditorProps) {
  const { field } = props;

  const validations = fromFieldValidations(field.validations);
  const allContentTypes = props.baseSdk.space.getCachedContentTypes();

  return (
    <EntriesProvider sdk={props.baseSdk}>
      <FieldConnector<EntryReferenceValue>
        throttle={0}
        field={field}
        isInitiallyDisabled={props.isInitiallyDisabled}>
        {({ value, setValue, disabled, externalReset }) => {
          return (
            <SingleEntryReferenceEditor
              key={`single-reference-${externalReset}`}
              {...props}
              allContentTypes={allContentTypes}
              disabled={disabled}
              validations={validations}
              value={value}
              setValue={setValue}
            />
          );
        }}
      </FieldConnector>
    </EntriesProvider>
  );
}

EntryReferenceEditor.defaultProps = {
  isInitiallyDisabled: true
};
