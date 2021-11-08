import * as React from 'react';
import {
  ContentEntityType as EntityType,
  ScheduledAction,
} from '@contentful/field-editor-reference/dist/types';
import { entityHelpers, Entry, Asset, FieldExtensionSDK } from '@contentful/field-editor-shared';
import { getScheduleTooltipContent } from '@contentful/field-editor-reference';
import { truncate } from '../../helpers/truncate';

function getEntityInfo({
  entityTitle,
  entityStatus,
  contentTypeName,
}: {
  entityTitle: string;
  entityStatus: string;
  contentTypeName?: string;
}) {
  const title = truncate(entityTitle, 60) || 'Untitled';

  return `${contentTypeName || 'Asset'} "${title}", ${entityStatus}`;
}

interface EntryAssetTooltipProps {
  id: string;
  type: EntityType;
  sdk: FieldExtensionSDK;
}

export function EntryAssetTooltip({ id, type, sdk }: EntryAssetTooltipProps) {
  const [entityTitle, setEntityTitle] = React.useState('');
  const [entityStatus, setEntityStatus] = React.useState('');
  const [jobs, setJobs] = React.useState<ScheduledAction[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [hasError, setHasError] = React.useState(false);

  React.useEffect(() => {
    async function loadContent() {
      try {
        setIsLoading(true);
        setHasError(false);

        const actions = {
          Asset: {
            getEntity: sdk.space.getAsset,
            getEntityTitle: (args) => entityHelpers.getAssetTitle({ ...args, asset: args.entity }),
          },
          Entry: {
            getEntity: sdk.space.getEntry,
            getEntityTitle: (args) => entityHelpers.getEntryTitle({ ...args, entry: args.entity }),
          },
        };

        let contentType;
        const entity: Entry | Asset = await actions[type].getEntity(id);

        if (entity.sys.contentType) {
          const contentTypeId = entity.sys.contentType.sys.id;
          const contentTypes = sdk.space.getCachedContentTypes();
          contentType = contentTypes.find((ct) => ct.sys.id === contentTypeId);
        }

        const entityTitle: string = actions[type].getEntityTitle({
          entity,
          contentType,
          localeCode: sdk.field.locale,
          defaultLocaleCode: sdk.locales.default,
          entityType: type,
        });

        const jobs = await sdk.space.getEntityScheduledActions(type, id);
        const entityStatus = entityHelpers.getEntryStatus(entity.sys);

        setEntityTitle(entityTitle);
        setEntityStatus(entityStatus);
        setJobs(jobs);
      } catch (err) {
        console.log(err);
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    }

    loadContent();
  }, [id, type, sdk]);

  if (isLoading) {
    return <>{`Loading ${type.toLowerCase()}...`}</>;
  }

  if (hasError) {
    return <>{`${type} missing or inaccessible`}</>;
  }

  return (
    <>
      `${getEntityInfo({ entityTitle, contentTypeName: type, entityStatus })} $
      {jobs.length > 0 ? getScheduleTooltipContent({ job: jobs[0], jobsCount: jobs.length }) : ''}`
    </>
  );
}
