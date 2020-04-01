import * as React from 'react';
import { Entry, ContentType, FieldExtensionSDK, Action } from '../types';
import { ReferenceValidations } from '../utils/fromFieldValidations';
import { LinkActions } from '../components';

export function LinkEntryActions(props: {
  sdk: FieldExtensionSDK;
  allContentTypes: ContentType[];
  disabled: boolean;
  multiple: boolean;
  canCreateEntry: boolean;
  validations: ReferenceValidations;
  onCreate: (entry: Entry) => void;
  onLink: (entries: Entry[]) => void;
  onAction?: (action: Action) => void;
}) {
  const { sdk, validations } = props;

  const allowedContentTypes = props.validations.contentTypes
    ? props.allContentTypes.filter(contentType => {
        return props.validations.contentTypes?.includes(contentType.sys.id);
      })
    : props.allContentTypes;

  const onCreate = React.useCallback(async (contentTypeId?: string) => {
    if (contentTypeId) {
      const { entity, slide } = await sdk.navigator.openNewEntry<Entry>(contentTypeId, {
        slideIn: true
      });

      if (!entity) {
        return;
      }
      props.onCreate(entity);
      props.onAction &&
        props.onAction({ type: 'create_and_link', entity: 'Entry', entityData: entity, slide });
    }
  }, []);

  const onLinkExisting = React.useCallback(async () => {
    const entity = await sdk.dialogs.selectSingleEntry<Entry>({
      locale: props.sdk.field.locale,
      contentTypes: validations.contentTypes
    });
    if (!entity) {
      return;
    }
    props.onLink([entity]);
    props.onAction &&
      props.onAction({ type: 'select_and_link', entity: 'Entry', entityData: entity });
  }, []);

  const onLinkSeveralExisting = React.useCallback(async () => {
    const entities = await sdk.dialogs.selectMultipleEntries<Entry>({
      locale: props.sdk.field.locale,
      contentTypes: validations.contentTypes
    });

    if (!entities || entities.length === 0) {
      return;
    }
    props.onLink(entities);

    entities.forEach(entity => {
      props.onAction &&
        props.onAction({ type: 'select_and_link', entity: 'Entry', entityData: entity });
    });
  }, []);

  return (
    <LinkActions
      entityType="entry"
      multiple={props.multiple}
      disabled={props.disabled}
      canCreateEntity={allowedContentTypes.length > 0 && props.canCreateEntry}
      contentTypes={allowedContentTypes}
      onCreate={onCreate}
      onLinkExisting={props.multiple ? onLinkSeveralExisting : onLinkExisting}
    />
  );
}
