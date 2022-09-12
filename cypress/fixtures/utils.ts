import { Link } from '@contentful/app-sdk';

export const newLink = (linkType: string, id: string): Link => ({
  sys: {
    id,
    linkType,
    type: 'Link',
  },
});
