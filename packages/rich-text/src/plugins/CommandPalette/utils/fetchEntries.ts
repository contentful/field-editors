import { FieldExtensionSDK } from '@contentful/app-sdk';
import { entityHelpers } from '@contentful/field-editor-shared';
import { ContentTypeProps } from 'contentful-management/types';

export async function fetchEntries(
  sdk: FieldExtensionSDK,
  contentType: ContentTypeProps,
  query: string
) {
  const entries = await sdk.space.getEntries({
    content_type: contentType.sys.id,
    query,
  });

  return entries.items.map((entry) => {
    const description = entityHelpers.getEntityDescription({
      contentType,
      // @ts-expect-error inconsistent in typing between app-sdk & field-editors-shared
      entity: entry,
      localeCode: sdk.field.locale,
      defaultLocaleCode: sdk.locales.default,
    });

    const displayTitle = entityHelpers.getEntryTitle({
      // @ts-expect-error inconsistent in typing between app-sdk & field-editors-shared
      entry,
      contentType,
      localeCode: sdk.field.locale,
      defaultLocaleCode: sdk.locales.default,
      defaultTitle: 'Untitled',
    });

    return {
      contentTypeName: contentType.name,
      displayTitle: displayTitle,
      id: entry.sys.contentType.sys.id,
      description,
      entry,
    };
  });
}
