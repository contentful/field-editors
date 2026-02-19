import { useEffect, useState } from 'react';

import {
  Asset,
  ContentEntityType,
  Entry,
  FieldAppSDK,
  Link,
  ScheduledAction,
} from '@contentful/app-sdk';
import { entityHelpers } from '@contentful/field-editor-shared';
import { fetchContentType } from '@contentful/field-editor-shared/react-query';

import { getEntityInfo } from './utils';

export type FetchedEntityData = {
  jobs: ScheduledAction[];
  entity: Entry | Asset;
  entityTitle: string;
  entityDescription: string;
  entityStatus: ReturnType<typeof entityHelpers.getEntityStatus>;
  contentTypeName: string;
};

async function fetchAllData({
  sdk,
  entityId,
  entityType,
  localeCode,
  defaultLocaleCode,
}: {
  sdk: FieldAppSDK;
  entityId: string;
  entityType: ContentEntityType;
  localeCode: string;
  defaultLocaleCode: string;
}): Promise<FetchedEntityData> {
  const entity = await (entityType === 'Entry'
    ? sdk.cma.entry.get({ entryId: entityId })
    : sdk.cma.asset.get({ assetId: entityId }));
  const contentType = entity.sys.contentType
    ? await fetchContentType(sdk, entity.sys.contentType.sys.id)
    : undefined;
  const entityTitle =
    entityType === 'Entry'
      ? entityHelpers.getEntryTitle({
          //@ts-expect-error
          entry: entity,
          contentType,
          localeCode,
          defaultLocaleCode,
          defaultTitle: 'Untitled',
        })
      : entityHelpers.getAssetTitle({
          asset: entity as Asset,
          localeCode,
          defaultLocaleCode,
          defaultTitle: 'Untitled',
        });

  const entityDescription = entityHelpers.getEntityDescription({
    // @ts-expect-error
    entity,
    contentType,
    localeCode,
    defaultLocaleCode,
  });

  const jobs = await sdk.space.getEntityScheduledActions(entityType, entityId);

  const entityStatus = entityHelpers.getEntityStatus(
    entity.sys,
    sdk.parameters.instance.useLocalizedEntityStatus ? sdk.field.locale : undefined,
  );

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
  target: Link<ContentEntityType>;
  sdk: FieldAppSDK;
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
