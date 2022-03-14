import { useState, useEffect } from 'react';

import { FieldExtensionSDK, Link, Entry, Asset, ScheduledAction } from '@contentful/app-sdk';
import { entityHelpers } from '@contentful/field-editor-shared';

import { getEntityInfo } from './utils';

export type FetchedEntityData = {
  jobs: ScheduledAction[];
  entity: Entry | Asset;
  entityTitle: string;
  entityDescription: string;
  entityStatus: ReturnType<typeof entityHelpers.getEntryStatus>;
  contentTypeName: string;
};

async function fetchAllData({
  sdk,
  entityId,
  entityType,
  localeCode,
  defaultLocaleCode,
}: {
  sdk: FieldExtensionSDK;
  entityId: string;
  entityType: string;
  localeCode: string;
  defaultLocaleCode: string;
}): Promise<FetchedEntityData> {
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

export type EntityInfoProps = {
  target: Link;
  sdk: FieldExtensionSDK;
  onEntityFetchComplete?: VoidFunction;
};

function useRequestStatus({ sdk, target, onEntityFetchComplete }: EntityInfoProps) {
  const [requestStatus, setRequestStatus] = useState<{
    type: 'success' | 'loading' | 'error';
    data?: FetchedEntityData;
    error?: Error;
  }>({ type: 'loading' });

  useEffect(() => {
    if (target) {
      console.log('fetching again');
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
        })
        .finally(() => {
          onEntityFetchComplete?.();
        });
    }
  }, [sdk, target, onEntityFetchComplete]);

  return requestStatus;
}

export function useEntityInfo(props: EntityInfoProps) {
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
