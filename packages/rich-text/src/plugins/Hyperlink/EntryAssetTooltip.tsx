import * as React from 'react';
import { css } from 'emotion';
import tokens from '@contentful/forma-36-tokens';
import { EntityType, ScheduledAction } from '@contentful/field-editor-reference/dist/types';
import {
  entityHelpers,
  Entry,
  Asset,
  FieldExtensionSDK,
  ContentType,
} from '@contentful/field-editor-shared';
import { EntityStatusTag } from './EntityStatusTag';
import { truncate } from '../../helpers/truncate';
import { ScheduleTooltipContent } from './ScheduleTooltipContent';

const styles = {
  entityContentType: css({
    color: tokens.colorTextLightest,
    marginRight: tokens.spacingXs,
    '&:after': {
      content: '""',
    },
  }),
  entityTitle: css({
    marginRight: tokens.spacingXs,
  }),
  separator: css({
    background: tokens.colorTextMid,
    margin: tokens.spacingXs,
  }),
};

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
          const contentTypes = await sdk.space.getContentTypes();
          contentType = contentTypes.items.find(
            (ct) => (ct as ContentType).sys.id === contentTypeId
          );
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
      <div>
        <span className={styles.entityContentType}>{type || 'Asset'}</span>
        <span className={styles.entityTitle}>{truncate(entityTitle, 60) ?? 'Untitled'}</span>
        <EntityStatusTag statusLabel={entityStatus} />
      </div>
      {!!jobs.length && (
        <>
          <hr className={styles.separator} />
          <ScheduleTooltipContent job={jobs[0]} jobsCount={jobs.length} />
        </>
      )}
    </>
  );
}
