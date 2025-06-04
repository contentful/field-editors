import { BadgeVariant } from '@contentful/f36-components';
import { LocaleProps } from 'contentful-management/types';

export type ReleaseAction = 'publish' | 'unpublish' | 'not-in-release';

export type ReleaseEntityStatus = 'willPublish' | 'becomesDraft' | 'remainsDraft' | 'notInRelease';

export type ReleaseLocalesStatus = {
  status: ReleaseEntityStatus;
  variant: BadgeVariant;
  label: string;
  locale: LocaleProps;
};
export type ReleaseLocalesStatusMap = Map<string, ReleaseLocalesStatus>;
