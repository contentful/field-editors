import * as React from 'react';

import { FieldExtensionSDK } from '@contentful/app-sdk';
import '@testing-library/jest-dom/extend-expect';
import { fireEvent, render, screen } from '@testing-library/react';

import { useResource } from '../common/EntityStore';
import { MultipleResourceReferenceEditor } from './MultipleResourceReferenceEditor';
import { createFakeEntryResource, mockSdkForField } from './testHelpers/resourceEditorHelpers';

let mockedResources: Record<string, unknown> = {};

jest.mock('../common/EntityStore', () => {
  const module = jest.requireActual('../common/EntityStore');

  return {
    ...module,
    useResource: jest.fn((linkType: string, urn: string, apiUrl: string) => ({
      data: mockedResources[`${linkType}.${urn}`],
      status: 'success',
      apiUrl,
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
  type: 'Array',
  items: {
    type: 'ResourceLink',
  },
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

describe('Multiple resource editor', () => {
  it('renders the action button when no value is set', async () => {
    const sdk: FieldExtensionSDK = mockSdkForField(fieldDefinition);
    render(
      <MultipleResourceReferenceEditor
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
    const dialogFn = sdk.dialogs.selectMultipleResourceEntries;
    expect(dialogFn).toHaveBeenCalledTimes(1);
    const options = dialogFn.mock.calls[0][0];
    expect(options).toEqual({
      allowedResources: fieldDefinition.allowedResources,
    });
  });

  it('renders custom actions when passed', async () => {
    const sdk: FieldExtensionSDK = mockSdkForField(fieldDefinition);
    render(
      <MultipleResourceReferenceEditor
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

  describe('with value', () => {
    it('renders the cards', async () => {
      const { entryLinks, entryInfos } = generateMultipleTestResources();
      mockedResources = {};
      for (const [spaceId, link] of Object.entries(entryLinks)) {
        mockedResources[`${link.sys.linkType}.${link.sys.urn}`] = entryInfos[spaceId];
      }

      const sdk: FieldExtensionSDK = mockSdkForField(fieldDefinition, Object.values(entryLinks));
      render(
        <MultipleResourceReferenceEditor
          isInitiallyDisabled={false}
          sdk={sdk}
          hasCardEditActions={true}
          viewType="card"
          apiUrl="test-contentful"
          getEntryRouteHref={() => ''}
          // @ts-expect-error unused...
          parameters={{}}
        />
      );

      expect(useResource).toHaveBeenCalledTimes(Object.values(entryInfos).length);
      // ensure the card is rendered for every value
      const cards: Element[] = [];
      const entriesArray = Object.values(entryInfos) as any[];
      for (const info of Array.from(entriesArray.values())) {
        const entryTitle = info.resource.fields.title[info.defaultLocaleCode];
        const spaceName = info.space.name;
        const card = await expectEntryCard(entryTitle, spaceName);
        cards.push(card);
      }
    });

    describe('card actions', () => {
      it('should have a move to top button', async () => {
        const { entryLinks, entryInfos } = generateMultipleTestResources();
        mockedResources = {};

        for (const [spaceId, link] of Object.entries(entryLinks)) {
          mockedResources[`${link.sys.linkType}.${link.sys.urn}`] = entryInfos[spaceId];
        }

        const sdk: FieldExtensionSDK = mockSdkForField(fieldDefinition, Object.values(entryLinks));
        render(
          <MultipleResourceReferenceEditor
            isInitiallyDisabled={false}
            sdk={sdk}
            hasCardEditActions={true}
            viewType="card"
            apiUrl="test-contentful"
            getEntryRouteHref={() => ''}
            // @ts-expect-error unused...
            parameters={{}}
          />
        );

        // expect(useResource).toHaveBeenCalledTimes(Object.values(entryInfos).length);
        // linking more is available
        const linkExistingBtn = screen.queryByText('Add existing content');
        expect(linkExistingBtn).toBeInTheDocument();
        // ensure the card is rendered for every value
        const entriesArray = Object.values(entryInfos) as any[];

        const firstItem = entriesArray[0];
        await expectToNotHaveMoveButton(firstItem, 'Move to top');

        const allButFirst = entriesArray.slice(1);
        // move actions are available
        for (const info of allButFirst) {
          await expectToHaveMoveButton(info, 'Move to top');
        }
      });

      it('should have a move to bottom button', async () => {
        const { entryLinks, entryInfos } = generateMultipleTestResources();
        mockedResources = {};

        for (const [spaceId, link] of Object.entries(entryLinks)) {
          mockedResources[`${link.sys.linkType}.${link.sys.urn}`] = entryInfos[spaceId];
        }

        const sdk: FieldExtensionSDK = mockSdkForField(fieldDefinition, Object.values(entryLinks));
        render(
          <MultipleResourceReferenceEditor
            isInitiallyDisabled={false}
            sdk={sdk}
            hasCardEditActions={true}
            viewType="card"
            apiUrl="test-contentful"
            getEntryRouteHref={() => ''}
            // @ts-expect-error unused...
            parameters={{}}
          />
        );

        // expect(useResource).toHaveBeenCalledTimes(Object.values(entryInfos).length);
        // linking more is available
        const linkExistingBtn = screen.queryByText('Add existing content');
        expect(linkExistingBtn).toBeInTheDocument();
        // ensure the card is rendered for every value
        const entriesArray = Object.values(entryInfos) as any[];

        const lastItem = entriesArray[entriesArray.length - 1];
        await expectToNotHaveMoveButton(lastItem, 'Move to bottom');

        const allButLast = entriesArray.slice(0, -1);
        for (const info of allButLast) {
          await expectToHaveMoveButton(info, 'Move to bottom');
        }
      });

      it('works when using remove action', async () => {
        const { entryLinks, entryInfos } = generateMultipleTestResources();
        mockedResources = {};

        for (const [spaceId, link] of Object.entries(entryLinks)) {
          mockedResources[`${link.sys.linkType}.${link.sys.urn}`] = entryInfos[spaceId];
        }

        const sdk: FieldExtensionSDK = mockSdkForField(fieldDefinition, Object.values(entryLinks));
        render(
          <MultipleResourceReferenceEditor
            isInitiallyDisabled={false}
            sdk={sdk}
            hasCardEditActions={true}
            viewType="card"
            apiUrl="test-contentful"
            getEntryRouteHref={() => ''}
            // @ts-expect-error unused...
            parameters={{}}
          />
        );

        // expect(useResource).toHaveBeenCalledTimes(Object.values(entryInfos).length);
        // linking more is available
        const linkExistingBtn = screen.queryByText('Add existing content');
        expect(linkExistingBtn).toBeInTheDocument();
        // ensure the card is rendered for every value
        const entriesArray = Object.values(entryInfos) as any[];

        for (const info of entriesArray) {
          await clickCardActionsButton(info);
          const removeBtn = await screen.findByText('Remove', {
            selector: '[role="menuitem"]',
          });
          fireEvent.click(removeBtn);
        }

        // all cards were deleted
        expect(sdk.field.setValue).toHaveBeenCalledTimes(3);
        expect(sdk.field.setValue).toHaveBeenCalledWith([]);
      });
    });
  });
});

async function expectToHaveMoveButton(info: any, buttonString: string) {
  await clickCardActionsButton(info);
  await screen.findByText(buttonString, {
    selector: '[role="menuitem"]',
  });
}

async function expectToNotHaveMoveButton(info: any, buttonString: string) {
  await clickCardActionsButton(info);
  expect(
    screen.queryByText(buttonString, {
      selector: '[role="menuitem"]',
    })
  ).toBeNull();
}

async function clickCardActionsButton(info: any) {
  fireEvent.click(document.body);
  const entryTitle = info.resource.fields.title[info.defaultLocaleCode];
  const spaceName = info.space.name;
  const card = await expectEntryCard(entryTitle, spaceName);
  const actionsBtn = card.querySelector('[data-test-id="cf-ui-card-actions"]') as Element;
  expect(actionsBtn).toBeInTheDocument();
  fireEvent.click(actionsBtn);
}

async function expectEntryCard(entryTitle: string, spaceName: string): Promise<Element> {
  const title = await screen.findByText(entryTitle);

  await screen.findByText(spaceName);

  const theCard = title.closest('[data-test-id="cf-ui-entry-card"]') as Element;
  expect(theCard).toBeDefined();
  const actionsBtn = theCard?.querySelector('[data-test-id="cf-ui-card-actions"]') as Element;
  expect(actionsBtn).toBeDefined();
  return theCard;
}

type MultipleTestResource = {
  entryLinks: Record<string, any>;
  entryInfos: Record<string, any>;
};

function generateMultipleTestResources(): MultipleTestResource {
  return ['Space A', 'Space B', 'Space C'].reduce(
    (acc: MultipleTestResource, spaceName) => {
      const spaceId = spaceName.toLowerCase().replace(' ', '-');

      const entryInfo = {
        title: `An entry in ${spaceName}`,
        id: `linkedEntryId`,
      };
      acc.entryLinks[spaceId] = {
        sys: {
          type: 'ResourceLink',
          linkType: 'Contentful:Entry',
          urn: `crn:test:::content:spaces/${spaceId}/entries/${entryInfo.id}`,
        },
      };
      acc.entryInfos[spaceId] = createFakeEntryResource({
        title: entryInfo.title,
        id: entryInfo.id,
        space: {
          id: spaceId,
          name: spaceName,
        },
      });
      return acc;
    },
    { entryLinks: {}, entryInfos: {} }
  );
}
