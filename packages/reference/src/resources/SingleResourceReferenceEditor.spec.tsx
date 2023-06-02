import * as React from 'react';

import { FieldExtensionSDK } from '@contentful/app-sdk';
import '@testing-library/jest-dom/extend-expect';
import { fireEvent, render, screen } from '@testing-library/react';

import { useResource } from '../common/EntityStore';
import { SingleResourceReferenceEditor } from './SingleResourceReferenceEditor';
import { createFakeEntryResource, mockSdkForField } from './testHelpers/resourceEditorHelpers';

const mockedResources: Record<string, unknown> = {};

jest.mock('../common/EntityStore', () => {
  const module = jest.requireActual('../common/EntityStore');

  return {
    ...module,
    useResource: jest.fn((linkType: string, urn: string) => ({
      data: mockedResources[`${linkType}.${urn}`],
      status: 'success',
    })),
  };
});

jest.mock('react-intersection-observer', () => {
  const module = jest.requireActual('react-intersection-observer');

  return {
    ...module,
    useInView: () => ({ inView: true }),
  };
});

const fieldDefinition = {
  type: 'ResourceLink',
  id: 'foo',
  name: 'Foo',
  allowedResources: [
    {
      source: 'foo',
      contentTypes: ['bar'],
    },
  ],
  required: true,
  validations: [],
};
describe('Single resource editor', () => {
  it('renders the action button when no value is set', async () => {
    const sdk: FieldExtensionSDK = mockSdkForField(fieldDefinition);
    render(
      <SingleResourceReferenceEditor
        isInitiallyDisabled={false}
        sdk={sdk}
        hasCardEditActions={true}
        viewType="card"
        // @ts-expect-error unused...
        parameters={{}}
      />
    );

    const button = await screen.findByText('Add existing content');
    expect(button).toBeDefined();
    fireEvent.click(button);

    // @ts-expect-error wait app-sdk version update
    const dialogFn = sdk.dialogs.selectSingleResourceEntry;
    expect(dialogFn).toHaveBeenCalledTimes(1);
    const options = dialogFn.mock.calls[0][0];
    expect(options).toEqual({
      allowedResources: fieldDefinition.allowedResources,
    });
  });

  it('renders custom actions when passed', async () => {
    const sdk: FieldExtensionSDK = mockSdkForField(fieldDefinition);
    render(
      <SingleResourceReferenceEditor
        isInitiallyDisabled={false}
        sdk={sdk}
        hasCardEditActions={true}
        viewType="card"
        // @ts-expect-error unused...
        parameters={{}}
        renderCustomActions={() => <div data-testid="custom-actions" />}
      />
    );

    const customActions = await screen.findByTestId('custom-actions');
    expect(customActions).toBeDefined();
  });

  it('renders the card button when the value is set', async () => {
    const sdk: FieldExtensionSDK = mockSdkForField(fieldDefinition, {
      sys: {
        type: 'Link',
        linkType: 'Contentful:Entry',
        urn: 'crn:test:::content:spaces/x-space/entries/linkedEntryId',
      },
    });

    const info = createFakeEntryResource({
      title: 'Title of linked entry',
      id: 'linkedEntryId',
      space: {
        id: 'x-space',
        name: 'X Space',
      },
    });
    mockedResources[`Contentful:Entry.crn:test:::content:spaces/x-space/entries/linkedEntryId`] =
      info;

    render(
      <SingleResourceReferenceEditor
        isInitiallyDisabled={false}
        sdk={sdk}
        hasCardEditActions={true}
        viewType="card"
        apiUrl="test-contentful"
        getEntryRouteHref={jest.fn()}
        // @ts-expect-error unused...
        parameters={{}}
      />
    );

    expect(useResource).toHaveBeenCalled();
    // ensure the card is rendered
    const title = await screen.findByText('Title of linked entry');
    await screen.findByText('X Space');

    const theCard = title.closest('[data-test-id="cf-ui-entry-card"]');
    const actionsBtn = theCard?.querySelector('[data-test-id="cf-ui-card-actions"]') as Element;
    expect(actionsBtn).toBeDefined();
    fireEvent.click(actionsBtn);

    const removeBtn = await screen.findByText('Remove', {
      selector: '[role="menuitem"]',
    });
    fireEvent.click(removeBtn);

    expect(sdk.field.removeValue).toHaveBeenCalledWith();

    const linkExistingBtn = screen.queryByText('Add existing content');
    expect(linkExistingBtn).not.toBeInTheDocument();
  });
});
