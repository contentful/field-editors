import * as React from 'react';

import type { FieldAppSDK } from '@contentful/app-sdk';
import { SharedQueryClientProvider } from '@contentful/field-editor-shared/react-query';
import { createTestQueryClient } from '@contentful/field-editor-test-utils';
import { INLINES } from '@contentful/rich-text-types';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import publishedCT from '../../shared/__fixtures__/published_content_type.json';
import publishedEntry from '../../shared/__fixtures__/published_entry.json';
import space from '../../shared/__fixtures__/space.json';
import { HyperlinkModal } from '../HyperlinkModal';

function renderResourceHyperlink(linkType: string) {
  const resourceLink = {
    sys: {
      type: 'ResourceLink' as const,
      linkType,
      urn: 'crn:contentful:::content:spaces/space-id/entries/linked-entry-urn',
    },
  };
  const selectSingleResourceEntity = vi
    .fn<FieldAppSDK['dialogs']['selectSingleResourceEntity']>()
    .mockResolvedValue(resourceLink);
  const allowedResources = [
    { type: 'Contentful:Entry', source: 'space-id', contentTypes: ['page'] },
  ];
  const sdk = {
    field: {
      locale: 'en-US',
      validations: [
        { enabledNodeTypes: [INLINES.RESOURCE_HYPERLINK] },
        { nodes: { [INLINES.RESOURCE_HYPERLINK]: { allowedResources } } },
      ],
    },
    ids: { entry: 'referencing-entry', space: 'space-id', environment: 'master' },
    dialogs: { selectSingleResourceEntity },
    cma: {
      entry: { get: vi.fn().mockResolvedValue(publishedEntry) },
      contentType: { get: vi.fn().mockResolvedValue(publishedCT) },
      space: { get: vi.fn().mockResolvedValue(space) },
      locale: { getMany: vi.fn().mockResolvedValue({ items: [{ default: true, code: 'en' }] }) },
    },
    locales: { default: 'en', available: ['en'], names: { en: 'English' } },
    space: { onEntityChanged: vi.fn() },
    navigator: {},
    parameters: { instance: {} },
  } as unknown as FieldAppSDK;
  const onClose = vi.fn();

  render(
    <SharedQueryClientProvider client={createTestQueryClient()}>
      <HyperlinkModal
        sdk={sdk}
        readonly={false}
        linkText="Entry link"
        linkType={INLINES.RESOURCE_HYPERLINK}
        onClose={onClose}
      />
    </SharedQueryClientProvider>,
  );

  return { allowedResources, onClose, resourceLink, selectSingleResourceEntity };
}

describe('resource hyperlink selection', () => {
  it('keeps the selected entry resource returned by the App SDK', async () => {
    const { allowedResources, onClose, resourceLink, selectSingleResourceEntity } =
      renderResourceHyperlink('Contentful:Entry');

    fireEvent.click(screen.getByText('Select entry'));

    await screen.findByText('Remove selection');
    expect(selectSingleResourceEntity).toHaveBeenCalledWith({
      allowedResources,
      locale: 'en-US',
      referencingEntryId: 'referencing-entry',
    });
    fireEvent.click(screen.getByRole('button', { name: 'Update' }));
    expect(onClose).toHaveBeenCalledWith({
      linkText: 'Entry link',
      linkType: INLINES.RESOURCE_HYPERLINK,
      linkTarget: '',
      linkEntity: resourceLink,
    });
  });

  it('does not accept a resource type that rich-text hyperlinks do not support', async () => {
    const { selectSingleResourceEntity } = renderResourceHyperlink('Contentful:Asset');

    await act(async () => {
      fireEvent.click(screen.getByText('Select entry'));
    });

    expect(selectSingleResourceEntity).toHaveBeenCalledOnce();
    expect(screen.queryByText(publishedEntry.fields.exField.en)).toBeNull();
    expect(screen.getByRole('button', { name: 'Update' })).toBeDisabled();
  });
});
