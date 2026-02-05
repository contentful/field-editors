import type { FieldAppSDK } from '@contentful/app-sdk';
import { entityHelpers } from '@contentful/field-editor-shared';
import type { ContentTypeProps } from 'contentful-management';

export async function fetchEntries(sdk: FieldAppSDK, contentType: ContentTypeProps, query: string) {
  const entries = await sdk.cma.entry.getMany({
    query: {
      query,
      content_type: contentType.sys.id,
    },
  });

  return entries.items.map((entry) => {
    const description = entityHelpers.getEntityDescription({
      contentType,
      entity: entry,
      localeCode: sdk.field.locale,
      defaultLocaleCode: sdk.locales.default,
    });

    const displayTitle = entityHelpers.getEntryTitle({
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
