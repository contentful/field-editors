import type { BadgeVariant } from '@contentful/f36-components';
import type { CollectionProp, ReleaseProps } from 'contentful-management/types';
import type { LocaleProps } from 'contentful-management/types';

export type ValidationType =
  | {
      type: 'max';
      max: number;
    }
  | {
      type: 'min';
      min: number;
    }
  | {
      type: 'min-max';
      min: number;
      max: number;
    };

export type ReleaseV2Entity = {
  entity: {
    sys: { type: 'Link'; linkType: 'Entry'; id: string };
  };
  action: 'publish' | 'unpublish';
};

export type ReleaseV2EntityWithLocales = {
  entity: {
    sys: { type: 'Link'; linkType: 'Entry'; id: string };
  };
  add: {
    fields: {
      '*': string[];
    };
  };
  remove: {
    fields: {
      '*': string[];
    };
  };
};

export type ReleaseV2Props = Omit<ReleaseProps, 'entities' | 'sys'> & {
  sys: ReleaseProps['sys'] & {
    schemaVersion: 'Release.v2';
  };
  entities: CollectionProp<ReleaseV2Entity | ReleaseV2EntityWithLocales>;
  startDate?: string;
};

export type ReleaseAction = 'publish' | 'unpublish' | 'not-in-release';

export type ReleaseEntityStatus = 'willPublish' | 'becomesDraft' | 'remainsDraft' | 'notInRelease';

export type ReleaseLocalesStatus = {
  status: ReleaseEntityStatus;
  variant: BadgeVariant;
  label: string;
  locale: LocaleProps;
};
export type ReleaseLocalesStatusMap = Map<string, ReleaseLocalesStatus>;
