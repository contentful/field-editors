import * as React from 'react';
import { css } from 'emotion';
import tokens from '@contentful/forma-36-tokens';
import { SpaceAPI } from 'contentful-ui-extensions-sdk';
import {
  EntryCard,
  DropdownList,
  DropdownListItem,
  Icon
} from '@contentful/forma-36-react-components';
import { Entry, File, ContentType } from '../../types';
import { isValidImage } from '../../utils/isValidImage';
import { entityHelpers } from '@contentful/field-editor-shared';
import { MissingEntityCard, ScheduledIconWithTooltip, AssetThumbnail } from '../../components';

const { getEntryTitle, getEntityDescription, getEntryStatus, getEntryImage } = entityHelpers;

const styles = {
  scheduleIcon: css({
    marginRight: tokens.spacing2Xs
  })
};

interface WrappedEntryCardProps {
  getEntityScheduledActions: SpaceAPI['getEntityScheduledActions'];
  getAsset: (assetId: string) => Promise<unknown>;
  getEntryUrl?: (entryId: string) => string;
  size: 'small' | 'default';
  disabled: boolean;
  onRemove: () => void;
  onEdit: () => void;
  localeCode: string;
  defaultLocaleCode: string;
  allContentTypes: ContentType[];
  entry: Entry;
  cardDragHandle?: React.ReactElement;
}

export function WrappedEntryCard(props: WrappedEntryCardProps) {
  const [file, setFile] = React.useState<null | File>(null);

  const contentType = props.allContentTypes.find(
    contentType => contentType.sys.id === props.entry?.sys.contentType.sys.id
  );

  React.useEffect(() => {
    if (props.entry) {
      getEntryImage(
        {
          entry: props.entry,
          contentType,
          localeCode: props.localeCode,
          defaultLocaleCode: props.defaultLocaleCode
        },
        props.getAsset
      )
        .then(file => {
          setFile(file);
        })
        .catch(() => {
          setFile(null);
        });
    }
  }, [props.entry, contentType, props.localeCode, props.defaultLocaleCode]);

  const status = getEntryStatus(props.entry?.sys);

  if (status === 'deleted') {
    return (
      <MissingEntityCard entityType="Entry" disabled={props.disabled} onRemove={props.onRemove} />
    );
  }

  const title = getEntryTitle({
    entry: props.entry,
    contentType,
    localeCode: props.localeCode,
    defaultLocaleCode: props.defaultLocaleCode,
    defaultTitle: 'Untitled'
  });

  const description = getEntityDescription({
    entity: props.entry,
    contentType,
    localeCode: props.localeCode,
    defaultLocaleCode: props.defaultLocaleCode
  });

  return (
    <EntryCard
      href={props.getEntryUrl ? props.getEntryUrl(props.entry.sys.id) : undefined}
      title={title}
      description={description}
      contentType={contentType?.name}
      size={props.size}
      status={status}
      statusIcon={
        <ScheduledIconWithTooltip
          getEntityScheduledActions={props.getEntityScheduledActions}
          entityType="Entry"
          entityId={props.entry.sys.id}>
          <Icon
            className={styles.scheduleIcon}
            icon="Clock"
            size="small"
            color="muted"
            testId="schedule-icon"
          />
        </ScheduledIconWithTooltip>
      }
      thumbnailElement={file && isValidImage(file) ? <AssetThumbnail file={file} /> : null}
      cardDragHandleComponent={props.cardDragHandle}
      withDragHandle={!!props.cardDragHandle}
      dropdownListElements={
        <React.Fragment>
          <DropdownList
            // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
            // @ts-ignore
            onClick={e => {
              e.stopPropagation();
            }}>
            {props.onEdit && (
              <DropdownListItem
                onClick={() => {
                  props.onEdit();
                }}
                testId="edit">
                Edit
              </DropdownListItem>
            )}
            {props.onRemove && (
              <DropdownListItem
                onClick={() => {
                  props.onRemove();
                }}
                isDisabled={props.disabled}
                testId="delete">
                Remove
              </DropdownListItem>
            )}
          </DropdownList>
        </React.Fragment>
      }
      onClick={e => {
        e.preventDefault();
        props.onEdit();
      }}
    />
  );
}
