import { published as published_entry } from '../entry';
import { indifferent } from '../space';

export const published = {
  sys: {
    urn: `crn:contentful:::content:spaces/${indifferent.sys.id}/entries/${published_entry.sys.id}`,
    type: 'ResourceLink',
    linkType: 'Contentful:Entry',
  },
};
