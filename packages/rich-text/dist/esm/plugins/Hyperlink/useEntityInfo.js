import { useEffect, useState } from 'react';
import { entityHelpers } from '@contentful/field-editor-shared';
import { getEntityInfo } from './utils';
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
    const entityTitle = entityType === 'Entry' ? entityHelpers.getEntryTitle({
        entry: entity,
        contentType,
        localeCode,
        defaultLocaleCode,
        defaultTitle: 'Untitled'
    }) : entityHelpers.getAssetTitle({
        asset: entity,
        localeCode,
        defaultLocaleCode,
        defaultTitle: 'Untitled'
    });
    const entityDescription = entityHelpers.getEntityDescription({
        entity,
        contentType,
        localeCode,
        defaultLocaleCode
    });
    const jobs = await sdk.space.getEntityScheduledActions(entityType, entityId);
    const entityStatus = entityHelpers.getEntityStatus(entity.sys, sdk.parameters.instance.useLocalizedEntityStatus ? sdk.field.locale : undefined);
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
    const [requestStatus, setRequestStatus] = useState({
        type: 'loading'
    });
    useEffect(()=>{
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
export function useEntityInfo(props) {
    const status = useRequestStatus(props);
    const { linkType } = props.target.sys;
    if (status.type === 'loading') {
        return `Loading ${linkType.toLowerCase()}...`;
    }
    if (status.type === 'error') {
        return `${linkType} missing or inaccessible`;
    }
    return getEntityInfo(status.data);
}
