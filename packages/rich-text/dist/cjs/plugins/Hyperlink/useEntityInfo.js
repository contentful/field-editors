"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "useEntityInfo", {
    enumerable: true,
    get: function() {
        return useEntityInfo;
    }
});
const _react = require("react");
const _fieldeditorshared = require("@contentful/field-editor-shared");
const _utils = require("./utils");
async function fetchAllData({ sdk, entityId, entityType, localeCode, defaultLocaleCode }) {
    let contentType;
    const entity = await (entityType === 'Entry' ? sdk.cma.entry.get({
        entryId: entityId
    }) : sdk.cma.asset.get({
        assetId: entityId
    }));
    if (entity.sys.contentType) {
        const contentTypeId = entity.sys.contentType.sys.id;
        contentType = sdk.space.getCachedContentTypes().find((ct)=>ct.sys.id === contentTypeId);
    }
    const entityTitle = entityType === 'Entry' ? _fieldeditorshared.entityHelpers.getEntryTitle({
        entry: entity,
        contentType,
        localeCode,
        defaultLocaleCode,
        defaultTitle: 'Untitled'
    }) : _fieldeditorshared.entityHelpers.getAssetTitle({
        asset: entity,
        localeCode,
        defaultLocaleCode,
        defaultTitle: 'Untitled'
    });
    const entityDescription = _fieldeditorshared.entityHelpers.getEntityDescription({
        entity,
        contentType,
        localeCode,
        defaultLocaleCode
    });
    const jobs = await sdk.space.getEntityScheduledActions(entityType, entityId);
    const entityStatus = _fieldeditorshared.entityHelpers.getEntityStatus(entity.sys, sdk.parameters.instance.useLocalizedEntityStatus ? sdk.field.locale : undefined);
    return {
        jobs,
        entity,
        entityTitle,
        entityDescription,
        entityStatus,
        contentTypeName: contentType ? contentType.name : ''
    };
}
function useRequestStatus({ sdk, target, onEntityFetchComplete }) {
    const [requestStatus, setRequestStatus] = (0, _react.useState)({
        type: 'loading'
    });
    (0, _react.useEffect)(()=>{
        if (target) {
            fetchAllData({
                sdk,
                entityId: target?.sys?.id,
                entityType: target?.sys?.linkType,
                localeCode: sdk.field.locale,
                defaultLocaleCode: sdk.locales.default
            }).then((entityInfo)=>{
                setRequestStatus({
                    type: 'success',
                    data: entityInfo
                });
            }).catch((e)=>{
                console.log(e);
                setRequestStatus({
                    type: 'error',
                    error: e
                });
            }).finally(()=>{
                onEntityFetchComplete?.();
            });
        }
    }, [
        sdk,
        target,
        onEntityFetchComplete
    ]);
    return requestStatus;
}
function useEntityInfo(props) {
    const status = useRequestStatus(props);
    const { linkType } = props.target.sys;
    if (status.type === 'loading') {
        return `Loading ${linkType.toLowerCase()}...`;
    }
    if (status.type === 'error') {
        return `${linkType} missing or inaccessible`;
    }
    return (0, _utils.getEntityInfo)(status.data);
}
