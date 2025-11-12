"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "fetchEntries", {
    enumerable: true,
    get: function() {
        return fetchEntries;
    }
});
const _fieldeditorshared = require("@contentful/field-editor-shared");
async function fetchEntries(sdk, contentType, query) {
    const entries = await sdk.cma.entry.getMany({
        query: {
            query,
            content_type: contentType.sys.id
        }
    });
    return entries.items.map((entry)=>{
        const description = _fieldeditorshared.entityHelpers.getEntityDescription({
            contentType,
            entity: entry,
            localeCode: sdk.field.locale,
            defaultLocaleCode: sdk.locales.default
        });
        const displayTitle = _fieldeditorshared.entityHelpers.getEntryTitle({
            entry,
            contentType,
            localeCode: sdk.field.locale,
            defaultLocaleCode: sdk.locales.default,
            defaultTitle: 'Untitled'
        });
        return {
            contentTypeName: contentType.name,
            displayTitle: displayTitle,
            id: entry.sys.contentType.sys.id,
            description,
            entry
        };
    });
}
