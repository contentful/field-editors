import { Asset, EntityType, Entry, FieldExtensionSDK } from '../../types';
import { ReferenceValidations } from '../../utils/fromFieldValidations';

export async function createEntity(props: {
  sdk: FieldExtensionSDK;
  entityType: EntityType;
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
    const { entity, slide } = await props.sdk.navigator.openNewAsset<Asset>({
      slideIn: true,
    });
    return { entity, slide };
  }
}

export async function selectSingleEntity(props: {
  sdk: FieldExtensionSDK;
  entityType: EntityType;
  validations: ReferenceValidations;
}) {
  if (props.entityType === 'Entry') {
    return await props.sdk.dialogs.selectSingleEntry<Entry>({
      locale: props.sdk.field.locale,
      contentTypes: props.validations.contentTypes,
    });
  } else {
    return props.sdk.dialogs.selectSingleAsset<Asset>({
      locale: props.sdk.field.locale,
      mimetypeGroups: props.validations.mimetypeGroups,
    });
  }
}

export async function selectMultipleEntities(props: {
  sdk: FieldExtensionSDK;
  entityType: EntityType;
  validations: ReferenceValidations;
}) {
  const value = props.sdk.field.getValue();

  const linkCount = Array.isArray(value) ? value.length : value ? 1 : 0;

  // TODO: Why not always set `min: 1` by default? Does it make sense to enforce
  //  user to select as many entities as the field's "min" requires? What if e.g.
  // "min" is 4 and the user wants to insert 2 entities first, then create 2 new ones?
  const min = Math.max((props.validations.numberOfLinks?.min || 1) - linkCount, 1);
  // TODO: Consider same for max. If e.g. "max" is 4, we disable the button if the
  //  user wants to select 5 but we show no information why the button is disabled.
  const max = (props.validations.numberOfLinks?.max || +Infinity) - linkCount;

  if (props.entityType === 'Entry') {
    return await props.sdk.dialogs.selectMultipleEntries<Entry>({
      locale: props.sdk.field.locale,
      contentTypes: props.validations.contentTypes,
      min,
      max,
    });
  } else {
    return props.sdk.dialogs.selectMultipleAssets<Asset>({
      locale: props.sdk.field.locale,
      mimetypeGroups: props.validations.mimetypeGroups,
      min,
      max,
    });
  }
}
