"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "newReferenceEditorFakeSdk", {
    enumerable: true,
    get: function() {
        return newReferenceEditorFakeSdk;
    }
});
const _fieldeditortestutils = require("@contentful/field-editor-test-utils");
const _fixtures = require("./fixtures");
const newLink = (linkType, id)=>({
        sys: {
            id,
            linkType,
            type: 'Link'
        }
    });
function newReferenceEditorFakeSdk(props) {
    const rawInitialValue = window.localStorage.getItem('initialValue');
    const initialValue = rawInitialValue ? JSON.parse(rawInitialValue) : props?.initialValue;
    const rawValidations = window.localStorage.getItem('fieldValidations');
    const validations = rawValidations ? JSON.parse(rawValidations) : props?.validations;
    const customizeMock = (field)=>{
        return validations ? {
            ...field,
            validations
        } : field;
    };
    const [field, mitt] = (0, _fieldeditortestutils.createFakeFieldAPI)(customizeMock, initialValue);
    const space = (0, _fieldeditortestutils.createFakeSpaceAPI)();
    const locales = (0, _fieldeditortestutils.createFakeLocalesAPI)();
    const entryLinks = [
        newLink('Entry', _fixtures.entries.published.sys.id),
        newLink('Entry', _fixtures.entries.changed.sys.id),
        newLink('Entry', _fixtures.entries.empty.sys.id)
    ];
    const assetLinks = [
        newLink('Asset', _fixtures.assets.published.sys.id),
        newLink('Asset', _fixtures.assets.changed.sys.id),
        newLink('Asset', _fixtures.assets.empty.sys.id)
    ];
    let selectorCounter = 0;
    const delay = (ms)=>{
        return new Promise((resolve)=>setTimeout(resolve, ms));
    };
    const localizeContentTypes = (contentTypes)=>{
        return contentTypes.map((contentType)=>({
                ...contentType,
                fields: contentType.fields.map((field)=>({
                        ...field,
                        localized: true
                    }))
            }));
    };
    const sdk = {
        field,
        locales,
        cma: {
            entry: {
                get: async ({ entryId })=>{
                    if (props?.fetchDelay) {
                        await delay(props.fetchDelay);
                    }
                    if (entryId === _fixtures.entries.empty.sys.id) {
                        return _fixtures.entries.empty;
                    }
                    if (entryId === _fixtures.entries.published.sys.id) {
                        return _fixtures.entries.published;
                    }
                    if (entryId === _fixtures.entries.changed.sys.id) {
                        return _fixtures.entries.changed;
                    }
                    return Promise.reject({});
                }
            },
            asset: {
                get: async ({ assetId })=>{
                    if (props?.fetchDelay) {
                        await delay(props.fetchDelay);
                    }
                    if (assetId === _fixtures.assets.empty.sys.id) {
                        return _fixtures.assets.empty;
                    }
                    if (assetId === _fixtures.assets.published.sys.id) {
                        return _fixtures.assets.published;
                    }
                    if (assetId === _fixtures.assets.changed.sys.id) {
                        return _fixtures.assets.changed;
                    }
                    return Promise.reject({});
                }
            },
            space: {
                get: async (params)=>{
                    if (params.spaceId === _fixtures.spaces.indifferent.sys.id) {
                        return _fixtures.spaces.indifferent;
                    }
                    return Promise.reject({});
                }
            },
            contentType: {
                get: async ({ contentTypeId })=>{
                    if (contentTypeId === _fixtures.contentTypes.published.sys.id) {
                        return _fixtures.contentTypes.published;
                    }
                    return Promise.reject({});
                }
            },
            locale: {
                getMany: async ()=>_fixtures.locales.list
            }
        },
        space: {
            ...space,
            getCachedContentTypes () {
                return localizeContentTypes(space.getCachedContentTypes());
            },
            getContentTypes () {
                return Promise.resolve(space.getContentTypes().then((response)=>{
                    return {
                        ...response,
                        items: localizeContentTypes(response.items)
                    };
                }));
            },
            async getEntityScheduledActions () {
                return [];
            }
        },
        dialogs: {
            selectSingleAsset: async ()=>{
                selectorCounter++;
                return assetLinks[selectorCounter % assetLinks.length];
            },
            selectMultipleAssets: async ()=>{
                selectorCounter++;
                return selectorCounter % 2 ? assetLinks.slice(0, 2) : [
                    assetLinks[2]
                ];
            },
            selectSingleEntry: async ()=>{
                selectorCounter++;
                return entryLinks[selectorCounter % entryLinks.length];
            },
            selectMultipleEntries: async ()=>{
                selectorCounter++;
                return selectorCounter % 2 ? entryLinks.slice(0, 2) : [
                    entryLinks[2]
                ];
            }
        },
        navigator: {
            openNewAsset: async ()=>({
                    entity: newLink('Asset', _fixtures.assets.empty.sys.id)
                }),
            openAsset: async ()=>{
                alert('open Asset in slide in');
                return {};
            },
            openNewEntry: async ()=>({
                    entity: newLink('Entry', _fixtures.entries.empty.sys.id)
                }),
            openEntry: async ()=>{
                alert('open entry in slide in');
                return {};
            },
            onSlideInNavigation: ()=>()=>({})
        },
        access: {
            can: async ()=>true
        },
        ids: {
            space: 'space-id',
            environment: 'environment-id'
        }
    };
    return [
        sdk,
        mitt
    ];
}
