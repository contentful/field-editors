import { FieldExtensionSDK } from '@contentful/app-sdk';
import { entityHelpers } from '@contentful/field-editor-shared';

export async function fetchAssets(sdk: FieldExtensionSDK) {
  const assets = await sdk.space.getAssets();

  return assets.items.map((asset) => {
    const displayTitle = entityHelpers.getAssetTitle({
      asset,
      localeCode: sdk.field.locale,
      defaultLocaleCode: sdk.locales.default,
      defaultTitle: 'Untitled',
    });

    return {
      // TODO: this is needed?
      contentTypeName: 'Asset',
      displayTitle,
      id: asset.sys.id,
      // TODO: we should rename this to `entity`
      entry: asset,
      thumbnail:
        asset.fields.file &&
        asset.fields.file[sdk.field.locale] &&
        `${asset.fields.file[sdk.field.locale].url}?h=30`,
    };
  });
}
