import * as React from 'react';

import {
  Badge,
  EntryCard,
  MenuItem,
  MenuDivider,
  Paragraph,
  Caption,
} from '@contentful/f36-components';
import tokens from '@contentful/f36-tokens';
import { css } from 'emotion';
import truncate from 'truncate';

import { ExternalResourceInfo } from '../../common/EntityStore';
import { ExternalResource, RenderDragFn } from '../../types';


export interface ExternalResourceCardProps {
  info: ExternalResourceInfo;
  isDisabled: boolean;
  isSelected?: boolean;
  onRemove?: () => void;
  onEdit?: () => void;
  onClick?: (e: React.MouseEvent<HTMLElement>) => void;
  renderDragHandle?: RenderDragFn;
  isClickable?: boolean;
  onMoveTop?: () => void;
  onMoveBottom?: () => void;
  hasCardEditActions?: boolean;
  hasCardMoveActions?: boolean;
  hasCardRemoveActions?: boolean;
}

const defaultProps = {
  isClickable: true,
  hasCardMoveActions: true,
  hasCardRemoveActions: true,
};

const styles = {
  subtitle: css({
    color: tokens.gray600,
    marginBottom: 'none',
  }),
  description: css({
    color: tokens.gray900,
    marginBottom: 'none',
    maxWidth: '642px',
  }),
};

function ExternalEntityBadge(badge: ExternalResource['fields']['badge']) {
  return badge ? <Badge variant={badge.variant}>{badge.label}</Badge> : null;
}

function ExternalResourceCardDescription({
  subtitle,
  description,
}: {
  subtitle?: string;
  description?: string;
}) {
  if (!subtitle) {
    return null;
  }

  if (!description) {
    return (
      <Paragraph className={styles.description} isWordBreak>
        {subtitle}
      </Paragraph>
    );
  }

  const truncatedDescription = truncate(description, 500, {});

  return (
    <>
      <Caption className={styles.subtitle}>{subtitle}</Caption>
      <Paragraph className={styles.description} isWordBreak>
        {truncatedDescription}
      </Paragraph>
    </>
  );
}

ExternalResourceCardDescription.displayName = 'ExternalResourceCardDescription';

export function ExternalResourceCard({
  info,
  isClickable,
  onEdit,
  onRemove,
  onMoveTop,
  onMoveBottom,
  hasCardEditActions,
  hasCardMoveActions,
  hasCardRemoveActions,
  renderDragHandle,
  onClick,
}: ExternalResourceCardProps) {
  const { resource: entity, resourceType } = info;
  const badge = ExternalEntityBadge(entity.fields.badge);
  return (
    <EntryCard
      as={entity.fields.externalUrl ? 'a' : 'article'}
      href={entity.fields.externalUrl}
      title={entity.fields.title}
      contentType={`${resourceType.sys.resourceProvider.sys.id} ${resourceType.name}`}
      size={'auto'}
      thumbnailElement={
        entity.fields.image?.url ? (
          <img alt={entity.fields.image.altText} src={entity.fields.image.url} />
        ) : undefined
      }
      dragHandleRender={renderDragHandle}
      withDragHandle={!!renderDragHandle}
      badge={badge}
      actions={[
        hasCardEditActions && onEdit ? (
          <MenuItem
            key="edit"
            testId="edit"
            onClick={() => {
              onEdit && onEdit();
            }}
          >
            Edit
          </MenuItem>
        ) : null,
        hasCardRemoveActions && onRemove ? (
          <MenuItem
            key="delete"
            testId="delete"
            onClick={() => {
              onRemove && onRemove();
            }}
          >
            Remove
          </MenuItem>
        ) : null,
        hasCardMoveActions && (onEdit || onRemove) && (onMoveTop || onMoveBottom) ? (
          <MenuDivider key="divider" />
        ) : null,
        hasCardMoveActions && onMoveTop ? (
          <MenuItem key="move-top" onClick={() => onMoveTop && onMoveTop()} testId="move-top">
            Move to top
          </MenuItem>
        ) : null,
        hasCardMoveActions && onMoveBottom ? (
          <MenuItem
            key="move-bottom"
            onClick={() => onMoveBottom && onMoveBottom()}
            testId="move-bottom"
          >
            Move to bottom
          </MenuItem>
        ) : null,
      ].filter((item) => item)}
      onClick={
        isClickable
          ? (e: React.MouseEvent<HTMLElement>) => {
              e.preventDefault();
              if (onClick) return onClick(e);
              onEdit && onEdit();
            }
          : undefined
      }
    >
      <ExternalResourceCardDescription
        subtitle={entity.fields.subtitle || `Product ID: ${entity.sys.id}`}
        description={entity.fields.description}
      />
    </EntryCard>
  );
}

ExternalResourceCard.defaultProps = defaultProps;
