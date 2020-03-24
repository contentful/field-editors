import * as React from 'react';
import deepEqual from 'deep-equal';
import { FieldConnector } from '@contentful/field-editor-shared';
import { EntryCard } from '@contentful/forma-36-react-components';
import { ViewType, EntryReferenceValue, Link, ContentType, FieldExtensionSDK } from './types';
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

  sdk: FieldExtensionSDK;

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
  const { sdk, validations, setValue } = props;

  const allowedContentTypes = props.validations.contentTypes
    ? props.allContentTypes.filter(contentType => {
        return props.validations.contentTypes?.includes(contentType.sys.id);
      })
    : props.allContentTypes;

  const onCreate = React.useCallback(async (contentTypeId?: string) => {
    if (contentTypeId) {
      const { entity } = await sdk.navigator.openNewEntry(contentTypeId, {
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
    const item = await sdk.dialogs.selectSingleEntry<Link>({
      locale: props.sdk.field.locale,
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
  const { value, sdk, disabled, setValue } = props;
  const { loadEntry, entries } = useEntriesStore();

  React.useEffect(() => {
    if (value?.sys.id) {
      loadEntry(value.sys.id);
    }
  }, [value?.sys.id]);

  React.useEffect(() => {
    const unsubscribe = sdk.navigator.onSlideInNavigation(({ oldSlideLevel, newSlideLevel }) => {
      if (value?.sys.id) {
        if (oldSlideLevel > newSlideLevel) {
          loadEntry(value.sys.id);
        }
      }
    });
    return () => {
      unsubscribe();
    };
  }, [sdk]);

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
      getAsset={props.sdk.space.getAsset}
      getEntityScheduledActions={props.sdk.space.getEntityScheduledActions}
      getEntryUrl={props.getEntryUrl}
      disabled={disabled}
      size={size}
      localeCode={props.sdk.field.locale}
      defaultLocaleCode={sdk.locales.default}
      allContentTypes={props.allContentTypes}
      entry={entry}
      onEdit={() => {
        sdk.navigator.openEntry(entry.sys.id, {
          slideIn: true
        });
      }}
      onRemove={() => {
        props.setValue(null);
      }}
    />
  );
}

export function EntryReferenceEditor(props: EntryReferenceEditorProps) {
  const validations = fromFieldValidations(props.sdk.field.validations);
  const allContentTypes = props.sdk.space.getCachedContentTypes();

  return (
    <EntriesProvider sdk={props.sdk}>
      <FieldConnector<EntryReferenceValue>
        throttle={0}
        field={props.sdk.field}
        isInitiallyDisabled={props.isInitiallyDisabled}
        isEqualValues={(value1, value2) => {
          return deepEqual(value1, value2);
        }}>
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
