export type ViewType = 'card' | 'link';

export type EntityType = 'entry' | 'asset';

export type SingleReferenceValue = {
  sys: {
    type: 'Link';
    id: string;
    linkType: 'Entry';
  };
};
