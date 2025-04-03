import { FieldAppSDK } from '@contentful/app-sdk';

export function mockSdkForField(fieldDefinition: any, fieldValue?: any): FieldAppSDK {
  return {
    field: {
      getValue: jest.fn(() => fieldValue),
      setValue: jest.fn(() => Promise.resolve(undefined)),
      removeValue: jest.fn(),
      // eslint-disable-next-line -- test helper
      onSchemaErrorsChanged: () => {},
      // eslint-disable-next-line -- test helper
      onIsDisabledChanged: () => {},
      getIsDisabled: () => false,
      // eslint-disable-next-line -- test helper
      onValueChanged: () => {},
      ...fieldDefinition,
      locale: 'en',
    },
    dialogs: {
      // @ts-expect-error wait app-sdk version update
      selectSingleResourceEntity: jest.fn().mockResolvedValue({
        sys: {
          type: 'ResourceLink',
          linkType: 'Contentful:Entry',
          urn: 'crn:contentful:::content:spaces/space-id/entries/example-entity-urn',
        },
      }),
      selectMultipleResourceEntities: jest.fn().mockResolvedValue([
        {
          sys: {
            type: 'ResourceLink',
            linkType: 'Contentful:Entry',
            urn: 'crn:contentful:::content:spaces/space-id/entries/example-entity-urn',
          },
        },
      ]),
    },
    ids: {
      space: 'myTestSpace',
      environment: 'master',
      organization: 'acme',
      user: 'norris_chuck',
      field: fieldDefinition.id,
      entry: 'testEntry',
      contentType: 'testCT',
    },
    space: {
      // @ts-expect-error wait app-sdk version update
      // eslint-disable-next-line -- test helper
      onEntityChanged: () => {},
    },
    // @ts-expect-error
    navigator: {
      onSlideInNavigation: () => () => ({}),
    },
  };
}

type FakeEntryResource = { title: string; id: string; space: { id: string; name: string } };

export const createFakeEntryResource = ({ title, id, space }: FakeEntryResource) => {
  const { id: spaceId, name: spaceName } = space;
  return {
    resource: {
      sys: {
        id,
        type: 'Entry',
        space: {
          sys: {
            id: spaceId,
          },
        },
        environment: {
          sys: {
            id: `${spaceId}-environment`,
          },
        },
      },
      fields: {
        title: {
          en: title,
        },
      },
    },
    contentType: {
      sys: {
        id: 'xTestCT',
      },
      displayField: 'title',
      fields: [
        {
          type: 'Symbol',
          id: 'title',
          name: 'The title',
        },
      ],
    },
    localeCode: 'en',
    defaultLocaleCode: 'en',
    space: { name: spaceName },
  };
};
