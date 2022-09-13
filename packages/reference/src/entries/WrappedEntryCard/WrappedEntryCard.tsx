import * as React from 'react';

import { SpaceAPI } from '@contentful/app-sdk';
import { EntryCard, MenuItem, MenuDivider } from '@contentful/f36-components';
import { ClockIcon } from '@contentful/f36-icons';
import tokens from '@contentful/f36-tokens';
import { entityHelpers, isValidImage } from '@contentful/field-editor-shared';
import { css } from 'emotion';

import { AssetThumbnail, MissingEntityCard, ScheduledIconWithTooltip } from '../../components';
import { SpaceName } from '../../components/SpaceName/SpaceName';
import { ContentType, Entry, File, RenderDragFn } from '../../types';

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
  onClick?: (e: React.MouseEvent<HTMLElement>) => void;
  localeCode: string;
  defaultLocaleCode: string;
  contentType?: ContentType;
  spaceName?: string;
  entry: Entry;
  renderDragHandle?: RenderDragFn;
  isClickable?: boolean;
  onMoveTop?: () => void;
  onMoveBottom?: () => void;
  hasCardEditActions: boolean;
  hasCardMoveActions?: boolean;
  hasCardRemoveActions?: boolean;
}

const defaultProps = {
  isClickable: true,
  hasCardEditActions: true,
  hasCardMoveActions: true,
  hasCardRemoveActions: true,
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
  }, [props.entry, props.getAsset, contentType, props.localeCode, props.defaultLocaleCode]);

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
    <EntryCard
      as={props.entryUrl ? 'a' : 'article'}
      href={props.entryUrl}
      title={title}
      description={description}
      contentType={contentType?.name}
      size={props.size}
      isSelected={props.isSelected}
      status={status}
      style={props.spaceName ? { backgroundColor: tokens.gray100 } : undefined}
      icon={
        props.spaceName ? (
          <SpaceName spaceName={props.spaceName} />
        ) : (
          <ScheduledIconWithTooltip
            getEntityScheduledActions={props.getEntityScheduledActions}
            entityType="Entry"
            entityId={props.entry.sys.id}>
            <ClockIcon
              className={styles.scheduleIcon}
              size="small"
              variant="muted"
              testId="schedule-icon"
            />
          </ScheduledIconWithTooltip>
        )
      }
      thumbnailElement={file && isValidImage(file) ? <AssetThumbnail file={file} /> : undefined}
      dragHandleRender={props.renderDragHandle}
      withDragHandle={!!props.renderDragHandle}
      actions={
        props.onEdit || props.onRemove
          ? [
              props.hasCardEditActions && props.onEdit ? (
                <MenuItem
                  key="edit"
                  testId="edit"
                  onClick={() => {
                    props.onEdit && props.onEdit();
                  }}>
                  Edit
                </MenuItem>
              ) : null,
              props.hasCardRemoveActions && props.onRemove ? (
                <MenuItem
                  key="delete"
                  testId="delete"
                  onClick={() => {
                    props.onRemove && props.onRemove();
                  }}>
                  Remove
                </MenuItem>
              ) : null,
              props.hasCardMoveActions && (props.onMoveTop || props.onMoveBottom) ? (
                <MenuDivider key="divider" />
              ) : null,
              props.hasCardMoveActions && props.onMoveTop ? (
                <MenuItem
                  key="move-top"
                  onClick={() => props.onMoveTop && props.onMoveTop()}
                  testId="move-top">
                  Move to top
                </MenuItem>
              ) : null,
              props.hasCardMoveActions && props.onMoveBottom ? (
                <MenuItem
                  key="move-bottom"
                  onClick={() => props.onMoveBottom && props.onMoveBottom()}
                  testId="move-bottom">
                  Move to bottom
                </MenuItem>
              ) : null,
            ].filter((item) => item)
          : []
      }
      onClick={
        // Providing an onClick handler messes up with some rich text
        // features e.g. pressing ENTER on a card to add a new paragraph
        // underneath. It's crucial not to pass a custom handler when
        // isClickable is disabled which in the case of RT it's.
        props.isClickable
          ? (e: React.MouseEvent<HTMLElement>) => {
              e.preventDefault();
              if (props.onClick) return props.onClick(e);
              props.onEdit && props.onEdit();
            }
          : undefined
      }
    />
  );
}

WrappedEntryCard.defaultProps = defaultProps;
