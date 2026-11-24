import { FieldAppSDK } from '@contentful/app-sdk';
import { vi } from 'vitest';

export function mockSdkForField(fieldDefinition: any, fieldValue?: any): FieldAppSDK {
  return {
    field: {
      getValue: vi.fn(() => fieldValue),
      setValue: vi.fn(() => Promise.resolve(undefined)),
      removeValue: vi.fn(),

      onSchemaErrorsChanged: () => {},

      onIsDisabledChanged: () => {},
      getIsDisabled: () => false,

      onValueChanged: () => {},
      ...fieldDefinition,
      locale: 'en',
    },
    dialogs: {
      selectSingleResourceEntity: vi
        .fn<FieldAppSDK['dialogs']['selectSingleResourceEntity']>()
        .mockResolvedValue({
          sys: {
            type: 'ResourceLink',
            linkType: 'Contentful:Entry',
            urn: 'crn:contentful:::content:spaces/space-id/entries/example-entity-urn',
          },
        }),
      selectMultipleResourceEntities: vi
        .fn<FieldAppSDK['dialogs']['selectMultipleResourceEntities']>()
        .mockResolvedValue([
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
      onEntityChanged: () => {},
    },
    navigator: {
      onSlideInNavigation: () => () => ({}),
    },
  } as unknown as FieldAppSDK;
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
