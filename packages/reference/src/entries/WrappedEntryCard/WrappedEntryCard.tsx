import * as React from 'react';
import { css } from 'emotion';
import tokens from '@contentful/forma-36-tokens';
import { SpaceAPI } from 'contentful-ui-extensions-sdk';
import {
  EntryCard,
  DropdownList,
  DropdownListItem,
  Icon,
} from '@contentful/forma-36-react-components';
import { Entry, File, ContentType } from '../../types';
import { isValidImage } from '../../utils/isValidImage';
import { entityHelpers } from '@contentful/field-editor-shared';
import { MissingEntityCard, ScheduledIconWithTooltip, AssetThumbnail } from '../../components';

const { getEntryTitle, getEntityDescription, getEntryStatus, getEntryImage } = entityHelpers;

const styles = {
  scheduleIcon: css({
    marginRight: tokens.spacing2Xs,
  }),
};

export interface WrappedEntryCardProps {
  getEntityScheduledActions: SpaceAPI['getEntityScheduledActions'];
  getAsset: (assetId: string) => Promise<unknown>;
  entryUrl?: string;
  size: 'small' | 'default' | 'auto';
  isDisabled: boolean;
  isSelected?: boolean;
  onRemove?: () => void;
  onEdit?: () => void;
  localeCode: string;
  defaultLocaleCode: string;
  contentType?: ContentType;
  entry: Entry;
  cardDragHandle?: React.ReactElement;
  isClickable?: boolean;
  hasCardEditActions: boolean;
  onMoveTop?: () => void;
  onMoveBottom?: () => void;
}

const defaultProps = {
  isClickable: true,
  hasCardEditActions: true,
};

export function WrappedEntryCard(props: WrappedEntryCardProps) {
  const [file, setFile] = React.useState<null | File>(null);

  const { contentType } = props;

  React.useEffect(() => {
    if (props.entry) {
      getEntryImage(
        {
          entry: props.entry,
          contentType,
          localeCode: props.localeCode,
          defaultLocaleCode: props.defaultLocaleCode,
        },
        props.getAsset
      )
        .then((file) => {
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
      <MissingEntityCard
        entityType="Entry"
        isDisabled={props.isDisabled}
        onRemove={props.onRemove}
      />
    );
  }

  const title = getEntryTitle({
    entry: props.entry,
    contentType,
    localeCode: props.localeCode,
    defaultLocaleCode: props.defaultLocaleCode,
    defaultTitle: 'Untitled',
  });

  const description = getEntityDescription({
    entity: props.entry,
    contentType,
    localeCode: props.localeCode,
    defaultLocaleCode: props.defaultLocaleCode,
  });

  return (
    // TODO: There should be dedicated components for each `size` with a different
    //  set of params (e.g. `file` should only be relevant for the "small" size card.
    <EntryCard
      href={props.entryUrl}
      title={title}
      description={description}
      contentType={contentType?.name}
      size={props.size}
      // @ts-ignore
      selected={props.isSelected}
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
          {props.onEdit || props.onRemove ? (
            <DropdownList
              // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
              // @ts-ignore
              onClick={(e) => {
                e.stopPropagation();
              }}>
              {props.hasCardEditActions && props.onEdit && (
                <DropdownListItem
                  onClick={() => {
                    props.onEdit && props.onEdit();
                  }}
                  testId="edit">
                  Edit
                </DropdownListItem>
              )}
              {props.onRemove && (
                <DropdownListItem
                  onClick={() => {
                    props.onRemove && props.onRemove();
                  }}
                  isDisabled={props.isDisabled}
                  testId="delete">
                  Remove
                </DropdownListItem>
              )}
            </DropdownList>
          ) : undefined}
          {props.onMoveTop || props.onMoveBottom ? (
            <DropdownList
              border="top"
              // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
              // @ts-ignore
              onClick={(e) => {
                e.stopPropagation();
              }}>
              {props.onMoveTop && (
                <DropdownListItem
                  onClick={() => props.onMoveTop && props.onMoveTop()}
                  testId="move-top">
                  Move to top
                </DropdownListItem>
              )}
              {props.onMoveBottom && (
                <DropdownListItem
                  onClick={() => props.onMoveBottom && props.onMoveBottom()}
                  testId="move-bottom">
                  Move to bottom
                </DropdownListItem>
              )}
            </DropdownList>
          ) : undefined}
        </React.Fragment>
      }
      onClick={(e) => {
        e.preventDefault();
        if (!props.isClickable) return;
        props.onEdit && props.onEdit();
      }}
    />
  );
}

WrappedEntryCard.defaultProps = defaultProps;
