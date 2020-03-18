import React from 'react';
import PropTypes from 'prop-types';
import { hyperlinkTooltipStyles as styles } from './styles';
import { Tag } from '@contentful/forma-36-react-components';
import { ScheduleTooltipContent } from '@contentful/field-editor-reference';
import { entityHelpers } from '@contentful/field-editor-shared';
import { truncate } from './truncate';

async function fetchAllData({ widgetAPI, entityId, entityType, localeCode, defaultLocaleCode }) {
  let contentType;

  const getEntity = entityType === 'Entry' ? widgetAPI.space.getEntry : widgetAPI.space.getAsset;
  const entity = await getEntity(entityId);
  if (entity.sys.contentType) {
    const contentTypeId = entity.sys.contentType.sys.id;
    contentType = await widgetAPI.space.getContentType(contentTypeId);
  }

  const entityTitle =
    entityType === 'Entry'
      ? entityHelpers.getEntryTitle({
          entry: entity,
          contentType,
          localeCode,
          defaultLocaleCode,
          defaultTitle: 'Untitled'
        })
      : entityHelpers.getAssetTitle({
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

  const jobs = await widgetAPI.space.getEntityScheduledActions(entityType, entityId);

  const entityStatus = entityHelpers.getEntryStatus(entity.sys);

  return {
    jobs,
    entity,
    entityTitle,
    entityDescription,
    entityStatus,
    contentTypeName: contentType ? contentType.name : ''
  };
}

// eslint-disable-next-line react/prop-types
function renderEntityInfo({ entityTitle, entityStatus, contentTypeName }) {
  const title = truncate(entityTitle, 60) || 'Untitled';
  return (
    <div>
      <span className={styles.entityContentType}>{contentTypeName || 'Asset'}</span>
      <span className={styles.entityTitle}>{title}</span>
      <EntityStatusTag statusLabel={entityStatus} />
    </div>
  );
}

function EntityStatusTag({ className, statusLabel }) {
  const tagTypeMap = {
    published: 'positive',
    draft: 'warning',
    archived: 'negative',
    changed: 'primary'
  };
  return (
    <Tag className={className} tagType={tagTypeMap[statusLabel]}>
      {statusLabel}
    </Tag>
  );
}

EntityStatusTag.propTypes = {
  className: PropTypes.string,
  statusLabel: PropTypes.string.isRequired
};

export function EntityHyperlinkTooltip(props) {
  const { widgetAPI } = props.richTextAPI;
  const { target } = props;

  const [requestStatus, setRequestStatus] = React.useState({ type: 'loading' });

  React.useEffect(() => {
    fetchAllData({
      widgetAPI,
      entityId: target.sys.id,
      entityType: target.sys.linkType,
      localeCode: widgetAPI.field.locale,
      defaultLocaleCode: widgetAPI.locales.default
    })
      .then(entityInfo => {
        setRequestStatus({ type: 'success', data: entityInfo });
      })
      .catch(e => {
        console.log(e);
        setRequestStatus({ type: 'error', error: e });
      });
  }, []); // eslint-disable-line

  if (requestStatus.type === 'loading') {
    return `Loading ${target.sys.linkType.toLowerCase()}...`;
  }
  let tooltip = '';
  if (requestStatus.type === 'error') {
    tooltip = `${target.sys.linkType} missing or inaccessible`;
  } else {
    const { jobs, ...entityInfo } = requestStatus.data;
    tooltip = (
      <>
        {renderEntityInfo(entityInfo)}
        {jobs.length > 0 ? (
          <>
            <hr className={styles.separator} />
            <ScheduleTooltipContent job={jobs[0]} jobsCount={jobs.length} />
          </>
        ) : null}
      </>
    );
  }
  return tooltip;
}
