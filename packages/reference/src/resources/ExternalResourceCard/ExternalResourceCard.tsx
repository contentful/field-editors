import * as React from 'react';

import { Badge, EntryCard, MenuItem, MenuDivider } from '@contentful/f36-components';

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

function ExternalEntityBadge(badge: ExternalResource['fields']['badge']) {
  return badge ? <Badge variant={badge.variant}>{badge.label}</Badge> : null;
}

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
      description={entity.fields.description}
      contentType={resourceType.name}
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
            }}>
            Edit
          </MenuItem>
        ) : null,
        hasCardRemoveActions && onRemove ? (
          <MenuItem
            key="delete"
            testId="delete"
            onClick={() => {
              onRemove && onRemove();
            }}>
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
            testId="move-bottom">
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
    />
  );
}

ExternalResourceCard.defaultProps = defaultProps;
