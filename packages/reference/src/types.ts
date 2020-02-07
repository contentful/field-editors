export type ViewType = 'card' | 'link';

export type EntityType = 'entry' | 'asset';

export type SingleReferenceValue = {
  sys: {
    type: 'Link';
    id: string;
    linkType: 'Entry';
  };
};

export interface Entry {
  sys: EntrySys;
  fields: {
    [key: string]: {
      [localeKey: string]: any;
    };
  };
}

interface LinkSys {
  type: string;
  linkType: string;
  id: string;
}

interface EntrySys {
  space: {
    sys: LinkSys;
  };
  id: string;
  type: string;
  createdAt: string;
  updatedAt: string;
  environment: {
    sys: LinkSys;
  };
  publishedVersion: number;
  publishedAt: string;
  firstPublishedAt: string;
  createdBy: {
    sys: LinkSys;
  };
  updatedBy: {
    sys: LinkSys;
  };
  publishedCounter: number;
  version: number;
  publishedBy: {
    sys: LinkSys;
  };
  contentType: {
    sys: LinkSys;
  };
}
