import { AccessAPI, ContentType, FieldAPI } from '@contentful/app-sdk';
import { createFakeFieldAPI } from '@contentful/field-editor-test-utils';
import { renderHook } from '@testing-library/react-hooks';

import { FieldAppSDK } from '../types';
import { EditorPermissionsProps, useEditorPermissions } from './useEditorPermissions';

type ExtendedAccessAPI = AccessAPI & {
  canPerformActionOnEntryOfType: (action: string, contentTypeId: string) => Promise<boolean>;
};

describe('useEditorPermissions', () => {
  type MockedFieldAppSDK = Omit<FieldAppSDK, 'access'> & {
    access: jest.Mocked<ExtendedAccessAPI>;
  };

  const makeFieldAppSDK = (customizeMock?: (fieldApi: FieldAPI) => FieldAPI) =>
    ({
      field: createFakeFieldAPI(customizeMock)[0],
      access: {
        can: jest.fn().mockResolvedValue(true),
        canPerformActionOnEntryOfType: jest.fn().mockResolvedValue(true),
      },
    } as unknown as MockedFieldAppSDK);

  const makeContentType = (id: string) =>
    ({
      sys: { id },
    } as ContentType);

  const renderEditorPermissions = async ({
    entityType,
    params = {},
    allContentTypes = [],
    customizeMock,
    customizeSdk,
    waitForUpdate = false,
  }: {
    entityType: EditorPermissionsProps['entityType'];
    params?: EditorPermissionsProps['parameters']['instance'];
    allContentTypes?: EditorPermissionsProps['allContentTypes'];
    customizeMock?: (fieldApi: FieldAPI) => FieldAPI;
    customizeSdk?: (sdk: MockedFieldAppSDK) => void;
    waitForUpdate?: boolean;
  }) => {
    const sdk = makeFieldAppSDK(customizeMock);
    customizeSdk?.(sdk);
    const renderResult = renderHook(() =>
      useEditorPermissions({
        sdk,
        allContentTypes,
        entityType,
        parameters: { instance: params },
      })
    );

    if (waitForUpdate) {
      await renderResult.waitForNextUpdate();
    }

    return { ...renderResult, sdk };
  };

  describe(`behaviour on Asset`, () => {
    it(`wont check access when turned off via instance params`, async () => {
      const { result, sdk } = await renderEditorPermissions({
        entityType: 'Asset',
        params: { showCreateEntityAction: false, showLinkEntityAction: false },
      });

      expect(result.current.canCreateEntity).toBe(false);
      expect(result.current.canLinkEntity).toBe(false);
      expect(sdk.access.can).not.toHaveBeenCalledWith();
    });

    it(`checks basic access`, async () => {
      const { sdk } = await renderEditorPermissions({ entityType: 'Asset' });

      expect(sdk.access.can).toHaveBeenCalledWith('create', 'Asset');
      expect(sdk.access.can).toHaveBeenCalledWith('read', 'Asset');
    });

    it(`defaults link asset action visibility to true`, async () => {
      const { result } = await renderEditorPermissions({ entityType: 'Asset' });

      expect(result.current.canLinkEntity).toBeTruthy();
    });

    it(`returns empty contentTypes`, async () => {
      const { result } = await renderEditorPermissions({
        entityType: 'Asset',
        allContentTypes: [makeContentType('one')],
      });

      expect(result.current.creatableContentTypes).toEqual([]);
    });
  });

  describe(`behaviour on Entry`, () => {
    const allowContentTypes = (
      sdk: MockedFieldAppSDK,
      allowedAction: string,
      ...allowed: string[]
    ) => {
      sdk.access.canPerformActionOnEntryOfType.mockImplementation(
        async (action: string, contentTypeId: any) => {
          if (allowedAction === action && allowed.includes(contentTypeId)) {
            return true;
          }

          return false;
        }
      );
    };

    it(`wont check access when turned off via instance params`, async () => {
      const { result, sdk } = await renderEditorPermissions({
        entityType: 'Entry',
        params: { showCreateEntityAction: false, showLinkEntityAction: false },
      });

      expect(result.current.canCreateEntity).toBe(false);
      expect(result.current.canLinkEntity).toBe(false);
      expect(sdk.access.can).not.toHaveBeenCalledWith();
    });

    it(`only allows creation when one content-type can be created`, async () => {
      const allContentTypes = [makeContentType('one'), makeContentType('two')];

      const { result } = await renderEditorPermissions({
        entityType: 'Entry',
        allContentTypes,
        customizeSdk: (sdk) => {
          allowContentTypes(sdk, 'create', 'one');
        },
        waitForUpdate: true,
      });

      expect(result.current.canCreateEntity).toBe(true);
    });

    it.skip(`denies creation when no content-type can be created`, async () => {
      const allContentTypes = [makeContentType('one'), makeContentType('two')];

      const { result } = await renderEditorPermissions({
        entityType: 'Entry',
        allContentTypes,
        customizeSdk: (sdk) => {
          allowContentTypes(sdk, 'create');
        },
      });

      expect(result.current.canCreateEntity).toBe(false);
    });

    it(`only allows linking when one content-type can be read`, async () => {
      const allContentTypes = [makeContentType('one'), makeContentType('two')];

      const { result } = await renderEditorPermissions({
        entityType: 'Entry',
        allContentTypes,
        customizeSdk: (sdk) => {
          allowContentTypes(sdk, 'read', 'one');
        },
        waitForUpdate: true,
      });

      expect(result.current.canLinkEntity).toBe(true);
    });

    // eslint-disable-next-line -- TODO: describe this disable  jest/no-test-prefixes
    it.skip(`denies creation when no content-type can be read`, async () => {
      const allContentTypes = [makeContentType('one'), makeContentType('two')];

      const { result } = await renderEditorPermissions({
        entityType: 'Entry',
        allContentTypes,
        customizeSdk: (sdk) => {
          allowContentTypes(sdk, 'read');
        },
      });

      expect(result.current.canLinkEntity).toBe(false);
    });

    it(`returns creatableContentTypes from validations that can be created`, async () => {
      const allContentTypes = [makeContentType('one'), makeContentType('two')];

      const { result } = await renderEditorPermissions({
        entityType: 'Entry',
        allContentTypes,
        customizeMock: (field) => {
          field.validations = [{ linkContentType: ['two'] }];
          return field;
        },
        customizeSdk: (sdk) => {
          allowContentTypes(sdk, 'create', 'two');
        },
      });

      expect(result.current.creatableContentTypes).toEqual([allContentTypes[1]]);
    });
  });
});
