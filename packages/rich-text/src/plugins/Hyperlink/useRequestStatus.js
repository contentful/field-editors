import React from 'react';
import { entityHelpers } from '@contentful/field-editor-shared';

async function fetchAllData({ sdk, entityId, entityType, localeCode, defaultLocaleCode }) {
  let contentType;

  const getEntity = entityType === 'Entry' ? sdk.space.getEntry : sdk.space.getAsset;
  const entity = await getEntity(entityId);
  if (entity.sys.contentType) {
    const contentTypeId = entity.sys.contentType.sys.id;
    contentType = sdk.space.getCachedContentTypes().find((ct) => ct.sys.id === contentTypeId);
  }

  const entityTitle =
    entityType === 'Entry'
      ? entityHelpers.getEntryTitle({
          entry: entity,
          contentType,
          localeCode,
          defaultLocaleCode,
          defaultTitle: 'Untitled',
        })
      : entityHelpers.getAssetTitle({
          asset: entity,
          localeCode,
          defaultLocaleCode,
          defaultTitle: 'Untitled',
        });

  const entityDescription = entityHelpers.getEntityDescription({
    entity,
    contentType,
    localeCode,
    defaultLocaleCode,
  });

  const jobs = await sdk.space.getEntityScheduledActions(entityType, entityId);

  const entityStatus = entityHelpers.getEntryStatus(entity.sys);

  return {
    jobs,
    entity,
    entityTitle,
    entityDescription,
    entityStatus,
    contentTypeName: contentType ? contentType.name : '',
  };
}

export function useRequestStatus({ richTextAPI, target }) {
  const { sdk } = richTextAPI;

  const [requestStatus, setRequestStatus] = React.useState({ type: 'loading' });

  React.useEffect(() => {
    if (target) {
      fetchAllData({
        sdk,
        entityId: target?.sys?.id,
        entityType: target?.sys?.linkType,
        localeCode: sdk.field.locale,
        defaultLocaleCode: sdk.locales.default,
      })
        .then((entityInfo) => {
          setRequestStatus({ type: 'success', data: entityInfo });
        })
        .catch((e) => {
          console.log(e);
          setRequestStatus({ type: 'error', error: e });
        });
    }
  }, [target]); // eslint-disable-line

  return requestStatus;
}
