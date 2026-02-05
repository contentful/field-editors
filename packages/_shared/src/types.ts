import type { BadgeVariant } from '@contentful/f36-components';
import type { CollectionProp, ReleaseProps } from 'contentful-management';
import type { LocaleProps } from 'contentful-management';

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

//@TODO: use Release types from contentful management once they are ready
export type ReleaseV2Entity = {
  entity: {
    sys: { type: 'Link'; linkType: 'Entry' | 'Asset'; id: string };
  };
  action: 'publish' | 'unpublish';
};

export type ReleaseV2EntityWithLocales = {
  entity: {
    sys: { type: 'Link'; linkType: 'Entry' | 'Asset'; id: string };
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

export type ReleaseV2AnnotationType = 'Hidden' | 'Ideation';

export type ReleaseV2Annotations = {
  'Contentful:Timeline'?: {
    type?: ReleaseV2AnnotationType;
  };
};

export type ReleaseMetadataV2 = {
  annotations?: ReleaseV2Annotations;
};

export type ReleaseV2Props = Omit<ReleaseProps, 'entities' | 'sys'> & {
  sys: ReleaseProps['sys'] & {
    schemaVersion: 'Release.v2';
  };
  entities: CollectionProp<ReleaseV2Entity | ReleaseV2EntityWithLocales>;
  startDate?: string;
  metadata?: ReleaseMetadataV2;
};

export type ReleaseAction = 'publish' | 'unpublish' | 'not-in-release';

export type ReleaseEntityStatus =
  | 'willPublish'
  | 'becomesDraft'
  | 'remainsDraft'
  | 'notInRelease'
  | 'published';

export type ReleaseLocalesStatus = {
  status: ReleaseEntityStatus;
  variant: BadgeVariant;
  label: string;
  locale: Pick<LocaleProps, 'code' | 'default' | 'name'>;
};
export type ReleaseStatusMap = Map<string, ReleaseLocalesStatus>;
