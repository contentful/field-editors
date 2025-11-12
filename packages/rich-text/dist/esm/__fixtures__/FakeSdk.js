import { createFakeFieldAPI, createFakeLocalesAPI, createFakeSpaceAPI } from '@contentful/field-editor-test-utils';
import { assets, contentTypes, entries, locales as localesFixtures, spaces } from './fixtures';
const newLink = (linkType, id)=>({
        sys: {
            id,
            linkType,
            type: 'Link'
        }
    });
export function newReferenceEditorFakeSdk(props) {
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
    const [field, mitt] = createFakeFieldAPI(customizeMock, initialValue);
    const space = createFakeSpaceAPI();
    const locales = createFakeLocalesAPI();
    const entryLinks = [
        newLink('Entry', entries.published.sys.id),
        newLink('Entry', entries.changed.sys.id),
        newLink('Entry', entries.empty.sys.id)
    ];
    const assetLinks = [
        newLink('Asset', assets.published.sys.id),
        newLink('Asset', assets.changed.sys.id),
        newLink('Asset', assets.empty.sys.id)
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
                    if (entryId === entries.empty.sys.id) {
                        return entries.empty;
                    }
                    if (entryId === entries.published.sys.id) {
                        return entries.published;
                    }
                    if (entryId === entries.changed.sys.id) {
                        return entries.changed;
                    }
                    return Promise.reject({});
                }
            },
            asset: {
                get: async ({ assetId })=>{
                    if (props?.fetchDelay) {
                        await delay(props.fetchDelay);
                    }
                    if (assetId === assets.empty.sys.id) {
                        return assets.empty;
                    }
                    if (assetId === assets.published.sys.id) {
                        return assets.published;
                    }
                    if (assetId === assets.changed.sys.id) {
                        return assets.changed;
                    }
                    return Promise.reject({});
                }
            },
            space: {
                get: async (params)=>{
                    if (params.spaceId === spaces.indifferent.sys.id) {
                        return spaces.indifferent;
                    }
                    return Promise.reject({});
                }
            },
            contentType: {
                get: async ({ contentTypeId })=>{
                    if (contentTypeId === contentTypes.published.sys.id) {
                        return contentTypes.published;
                    }
                    return Promise.reject({});
                }
            },
            locale: {
                getMany: async ()=>localesFixtures.list
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
                    entity: newLink('Asset', assets.empty.sys.id)
                }),
            openAsset: async ()=>{
                alert('open Asset in slide in');
                return {};
            },
            openNewEntry: async ()=>({
                    entity: newLink('Entry', entries.empty.sys.id)
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
