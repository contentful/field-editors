import { Asset, ContentType, Entry } from '../types';
import * as React from 'react';
import { CustomActionProps } from './ReferenceEditor';

export type DefaultCardRenderer<T extends CustomCardProps> = (
  props?: T
) => React.ReactElement;

export type CustomCardRenderer<T extends CustomCardProps> = (
  props: T,
  linkActionsProps: CustomActionProps,
  renderDefaultCard: DefaultCardRenderer<T>
) => React.ReactElement | false;

export type CustomCardProps = {
  index?: number;
  localeCode: string;
  defaultLocaleCode: string;
  isDisabled: boolean;
  size: 'default' | 'small';
  cardDragHandle?: React.ReactElement;
  onEdit?: () => void;
  onRemove?: () => void;
  // TODO: specific types should be used instead of these props, but for that the ReferenceEditor props should accept a generic
  // Entry editor
  entry?: Entry;
  entryUrl?: string;
  contentType?: ContentType;
  // Asset editor
  asset?: Asset;
  href?: string;
};
