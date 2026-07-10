import * as React from 'react';

import { configure, render } from '@testing-library/react';
import { expect, test, vi } from 'vitest';

vi.mock('@contentful/field-editor-reference', async () => {
  const actual = await vi.importActual<typeof import('@contentful/field-editor-reference')>(
    '@contentful/field-editor-reference',
  );
  return {
    ...actual,
    useResource: () => ({ data: { fake: true }, status: 'pending' }),
  };
});

import { FetchingWrappedResourceInlineCard } from '../FetchingWrappedResourceInlineCard';

configure({ testIdAttribute: 'data-test-id' });

const sdk = {
  field: { locale: 'en-US' },
  ids: { entry: 'entry-id' },
  parameters: { instance: {} },
} as any;

const link = {
  linkType: 'Contentful:Entry' as const,
  urn: 'crn:contentful:::content:spaces/s/environments/e/entries/target',
  type: 'ResourceLink' as const,
};

test("renders the loading card when useResource returns status: 'pending' with data present (react-query v5)", () => {
  const { container } = render(
    <FetchingWrappedResourceInlineCard
      link={link as any}
      sdk={sdk}
      isSelected={false}
      isDisabled={false}
      onRemove={() => {}}
    />,
  );

  // The current guard falls through on 'pending' because it only checks
  // 'loading'. `data` is truthy here, so `data === undefined` also doesn't
  // catch it. Without the fix, this crashes accessing `resource.contentType`.
  expect(container.firstChild).not.toBeNull();
});
