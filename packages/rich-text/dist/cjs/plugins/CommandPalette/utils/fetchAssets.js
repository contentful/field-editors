"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "fetchAssets", {
    enumerable: true,
    get: function() {
        return fetchAssets;
    }
});
const _fieldeditorshared = require("@contentful/field-editor-shared");
async function fetchAssets(sdk, query) {
    const assets = await sdk.cma.asset.getMany({
        query: {
            query
        }
    });
    return assets.items.map((asset)=>{
        const displayTitle = _fieldeditorshared.entityHelpers.getAssetTitle({
            asset,
            localeCode: sdk.field.locale,
            defaultLocaleCode: sdk.locales.default,
            defaultTitle: 'Untitled'
        });
        return {
            contentTypeName: 'Asset',
            displayTitle,
            id: asset.sys.id,
            entity: asset,
            thumbnail: asset.fields.file && asset.fields.file[sdk.field.locale] && `${asset.fields.file[sdk.field.locale].url}?h=30`
        };
    });
}
