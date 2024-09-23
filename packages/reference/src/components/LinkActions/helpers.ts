import { EditorPermissions } from '../../common/useEditorPermissions';
import { Asset, ContentType, ContentEntityType, Entry, FieldAppSDK } from '../../types';

const getContentTypeIds = (contentTypes: ContentType[]) => contentTypes.map((ct) => ct.sys.id);

export async function createEntity(props: {
  sdk: FieldAppSDK;
  entityType: ContentEntityType;
  contentTypeId?: string;
}) {
  if (props.entityType === 'Entry') {
    if (!props.contentTypeId) {
      return {};
    }
    const { entity, slide } = await props.sdk.navigator.openNewEntry<Entry>(props.contentTypeId, {
      slideIn: true,
    });
    return { entity, slide };
  } else {
    const { entity, slide } = await props.sdk.navigator.openNewAsset({
      slideIn: true,
    });
    return { entity, slide };
  }
}

export async function selectSingleEntity(props: {
  sdk: FieldAppSDK;
  entityType: ContentEntityType;
  editorPermissions: EditorPermissions;
}) {
  if (props.entityType === 'Entry') {
    return await props.sdk.dialogs.selectSingleEntry<Entry>({
      locale: props.sdk.field.locale,
      // readable CTs do not cover cases where user has partial access to a CT entry,
      // e.g. via tags so we're passing in all available CTs (based on field validations)
      contentTypes: getContentTypeIds(props.editorPermissions.availableContentTypes),
    });
  } else {
    return props.sdk.dialogs.selectSingleAsset<Asset>({
      locale: props.sdk.field.locale,
      mimetypeGroups: props.editorPermissions.validations.mimetypeGroups,
    });
  }
}

export async function selectMultipleEntities(props: {
  sdk: FieldAppSDK;
  entityType: ContentEntityType;
  editorPermissions: EditorPermissions;
}) {
  const value = props.sdk.field.getValue();

  const linkCount = Array.isArray(value) ? value.length : value ? 1 : 0;

  // TODO: Why not always set `min: 1` by default? Does it make sense to enforce
  //  user to select as many entities as the field's "min" requires? What if e.g.
  // "min" is 4 and the user wants to insert 2 entities first, then create 2 new ones?
  const min = Math.max(
    (props.editorPermissions.validations.numberOfLinks?.min || 1) - linkCount,
    1
  );
  // TODO: Consider same for max. If e.g. "max" is 4, we disable the button if the
  //  user wants to select 5 but we show no information why the button is disabled.
  const max = (props.editorPermissions.validations.numberOfLinks?.max || +Infinity) - linkCount;

  if (props.entityType === 'Entry') {
    return await props.sdk.dialogs.selectMultipleEntries<Entry>({
      locale: props.sdk.field.locale,
      // readable CTs do not cover cases where user has partial access to a CT entry,
      // e.g. via tags so we're passing in all available CTs (based on field validations)
      contentTypes: getContentTypeIds(props.editorPermissions.availableContentTypes),
      min,
      max,
    });
  } else {
    return props.sdk.dialogs.selectMultipleAssets<Asset>({
      locale: props.sdk.field.locale,
      mimetypeGroups: props.editorPermissions.validations.mimetypeGroups,
      min,
      max,
    });
  }
}
