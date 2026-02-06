import { selectMultipleEntities, selectSingleEntity } from './helpers';

const makeContentType = (id: string) => ({ sys: { id } });

const makeSdk = () => ({
  field: {
    locale: 'en-US',
    getValue: jest.fn().mockReturnValue([]),
    validations: [],
  },
  dialogs: {
    selectSingleEntry: jest.fn(),
    selectMultipleEntries: jest.fn(),
  },
});

describe('LinkActions helpers', () => {
  it('uses validation content types when availableContentTypes is empty (single)', async () => {
    const sdk = makeSdk();

    await selectSingleEntity({
      sdk: sdk as any,
      entityType: 'Entry',
      editorPermissions: {
        canCreateEntity: true,
        canLinkEntity: true,
        creatableContentTypes: [],
        availableContentTypes: [],
        validations: { contentTypes: ['productListing', 'contextApp'] },
      },
    });

    expect(sdk.dialogs.selectSingleEntry).toHaveBeenCalledWith(
      expect.objectContaining({
        locale: 'en-US',
        contentTypes: ['productListing', 'contextApp'],
      }),
    );
  });

  it('uses validation content types when availableContentTypes is empty (multiple)', async () => {
    const sdk = makeSdk();

    await selectMultipleEntities({
      sdk: sdk as any,
      entityType: 'Entry',
      editorPermissions: {
        canCreateEntity: true,
        canLinkEntity: true,
        creatableContentTypes: [],
        availableContentTypes: [],
        validations: { contentTypes: ['productListing', 'contextApp'] },
      },
    });

    expect(sdk.dialogs.selectMultipleEntries).toHaveBeenCalledWith(
      expect.objectContaining({
        locale: 'en-US',
        contentTypes: ['productListing', 'contextApp'],
      }),
    );
  });

  it('prefers validation content types when both are present', async () => {
    const sdk = makeSdk();

    await selectSingleEntity({
      sdk: sdk as any,
      entityType: 'Entry',
      editorPermissions: {
        canCreateEntity: true,
        canLinkEntity: true,
        creatableContentTypes: [],
        availableContentTypes: [makeContentType('one'), makeContentType('two')] as any,
        validations: { contentTypes: ['productListing', 'contextApp'] },
      },
    });

    expect(sdk.dialogs.selectSingleEntry).toHaveBeenCalledWith(
      expect.objectContaining({
        locale: 'en-US',
        contentTypes: ['productListing', 'contextApp'],
      }),
    );
  });
});
