import get from 'lodash/get';
import isObject from 'lodash/isObject';
// eslint-disable-next-line you-dont-need-lodash-underscore/find
import find from 'lodash/find';
import { ContentType, ContentTypeField } from 'contentful-ui-extensions-sdk';

function titleOrDefault(title: string | undefined, defaultTitle: string) {
  if (!title || title.match(/^\s*$/)) {
    return defaultTitle;
  } else {
    return title;
  }
}

export function getFieldValue({
  /**
   * Expects an entity fetched with a flag Skip-Transformation: true
   */
  entity,
  fieldId,
  localeCode,
  defaultLocaleCode
}: {
  entity: {
    fields: { [key: string]: { [valueKey: string]: string | undefined } };
  };
  fieldId: string;
  localeCode: string;
  defaultLocaleCode: string;
}): string | undefined {
  const values = get(entity, ['fields', fieldId]);
  if (!isObject(values)) {
    return;
  }

  const firstLocaleCode = Object.keys(values)[0];

  return values[localeCode] || values[defaultLocaleCode] || values[firstLocaleCode];
}

export function getAssetTitle({
  asset,
  localeCode,
  defaultLocaleCode,
  defaultTitle
}: {
  asset: any;
  localeCode: string;
  defaultLocaleCode: string;
  defaultTitle: string;
}) {
  const title = getFieldValue({
    entity: asset,
    fieldId: 'title',
    localeCode,
    defaultLocaleCode
  });
  return titleOrDefault(title, defaultTitle);
}

export function getEntityDescription({
  entity,
  contentType,
  localeCode,
  defaultLocaleCode
}: {
  entity: any;
  contentType?: ContentType;
  localeCode: string;
  defaultLocaleCode: string;
}): string {
  if (!contentType) {
    return '';
  }

  const isTextField = (field: ContentTypeField) => ['Symbol', 'Text'].includes(field.type);
  const isDisplayField = (field: ContentTypeField) => field.id === contentType.displayField;
  const isMaybeSlugField = (field: ContentTypeField) => /\bslug\b/.test(field.name);
  const isDescriptionField = (field: ContentTypeField) =>
    isTextField(field) && !isDisplayField(field) && !isMaybeSlugField(field);

  // const descriptionField = contentType.data.fields.find(isDescriptionField);
  console.log(contentType);

  const descriptionField = ((contentType.fields as unknown) as ContentTypeField[]).find(
    isDescriptionField
  );

  if (!descriptionField) {
    return '';
  }

  return (
    getFieldValue({ entity, fieldId: descriptionField.id, localeCode, defaultLocaleCode }) || ''
  );
}

export function getEntryTitle({
  entry,
  contentType,
  localeCode,
  defaultLocaleCode,
  defaultTitle
}: {
  entry: any;
  contentType?: ContentType;
  localeCode: string;
  defaultLocaleCode: string;
  defaultTitle: string;
}) {
  let title;

  if (!contentType) {
    return defaultTitle;
  }

  const displayField = contentType.displayField;
  if (!displayField) {
    return defaultTitle;
  }

  const displayFieldInfo = find(contentType.fields, { id: displayField });

  if (!displayFieldInfo) {
    return defaultTitle;
  }

  // when localization for a field is "turned off",
  // we don't clean up the "old" localized data, so it is still in the response.
  // Therefore, we're checking if displayField is localizable.
  if (displayFieldInfo.localized) {
    title = getFieldValue({
      entity: entry,
      fieldId: displayField,
      localeCode,
      defaultLocaleCode
    });
    if (!title) {
      // Older content types may return id/apiName, but some entry lookup paths do not fetch raw data
      // In order to still return a title in this case, look for displayField as apiName in content type,
      // ...but still look for displayField as a field in the entry
      title = getFieldValue({
        entity: entry,
        fieldId: displayFieldInfo.id,
        localeCode,
        defaultLocaleCode
      });
    }
  } else {
    title = getFieldValue({
      entity: entry,
      fieldId: displayField,
      defaultLocaleCode,
      localeCode: ''
    });
    if (!title) {
      title = getFieldValue({
        entity: entry,
        fieldId: displayFieldInfo.id,
        defaultLocaleCode,
        localeCode: ''
      });
    }
  }

  return titleOrDefault(title, defaultTitle);
}
