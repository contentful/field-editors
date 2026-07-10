import * as React from 'react';

import { configure, render } from '@testing-library/react';
import { expect, test, vi } from 'vitest';

vi.mock('@contentful/field-editor-reference', async () => {
  const actual = await vi.importActual<typeof import('@contentful/field-editor-reference')>(
    '@contentful/field-editor-reference',
  );
  return {
    ...actual,
    useEntity: () => ({ data: undefined, status: 'pending' }),
    useEntityLoader: () => ({ getEntityScheduledActions: () => Promise.resolve([]) }),
  };
});

vi.mock('@contentful/field-editor-shared/react-query', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@contentful/field-editor-shared/react-query')>();
  return {
    ...actual,
    useContentType: () => ({ data: undefined }),
  };
});

import { FetchingWrappedInlineEntryCard } from '../FetchingWrappedInlineEntryCard';

configure({ testIdAttribute: 'data-test-id' });

const sdk = {
  field: { locale: 'en-US' },
  locales: { default: 'en-US' },
  parameters: { instance: {} },
} as any;

test("renders the loading card when useEntity returns status: 'pending' (react-query v5)", () => {
  const { container } = render(
    <FetchingWrappedInlineEntryCard
      sdk={sdk}
      entryId="entry-id"
      isSelected={false}
      isDisabled={false}
      onEdit={() => {}}
      onRemove={() => {}}
    />,
  );

  // Loading InlineEntryCard renders a skeleton, not the entity title. The
  // pre-fix bug would crash reading `entry.sys` because data is undefined.
  expect(container.querySelector('[data-test-id="cf-ui-skeleton-form"]')).not.toBeNull();
});
