import { useEffect, useMemo, useState } from 'react';

import isEqual from 'lodash/isEqual';

import { ContentType, ContentEntityType, FieldAppSDK } from '../types';
import { ReferenceValidations } from '../utils/fromFieldValidations';
import { ReferenceEditorProps } from './ReferenceEditor';
import { useAccessApi } from './useAccessApi';

type ContentTypePermissionsProps = {
  sdk: FieldAppSDK;
  entityType: ContentEntityType;
  parameters: ReferenceEditorProps['parameters'];
  allContentTypes: ContentType[];
  validations: ReferenceValidations;
};

type ContentTypePermissions = {
  creatableContentTypes: ContentType[];
  availableContentTypes: ContentType[];
};

async function filter<T, S extends T>(arr: T[], predicate: (value: T) => Promise<boolean>) {
  // intentionally parallel as we assume it's cached in the implementation of the access api
  const fail = Symbol();
  const results = await Promise.all(
    arr.map(async (item) => ((await predicate(item)) ? item : fail)),
  );

  return results.filter((x) => x !== fail) as S[];
}

export function useContentTypePermissions({
  entityType,
  validations,
  sdk,
  allContentTypes,
}: ContentTypePermissionsProps): ContentTypePermissions {
  const availableContentTypes = useMemo(() => {
    const validationContentTypes = validations.contentTypes ?? [];

    if (entityType === 'Asset') {
      return [];
    }

    // RACE CONDITION FIX: If allContentTypes hasn't loaded yet (empty array),
    // but we have validation content types, return empty array and wait for
    // allContentTypes to populate. The useMemo will recalculate when allContentTypes changes.
    const hasValidationContentTypes = validationContentTypes.length > 0;

    if (hasValidationContentTypes && allContentTypes.length === 0) {
      return [];
    }

    if (hasValidationContentTypes) {
      return allContentTypes.filter((ct) => validationContentTypes.includes(ct.sys.id));
    }

    return allContentTypes;
  }, [allContentTypes, entityType, validations.contentTypes]);

  const [creatableContentTypes, setCreatableContentTypes] = useState(availableContentTypes);
  const { canPerformActionOnEntryOfType } = useAccessApi(sdk.access);

  useEffect(() => {
    async function checkContentTypeAccess() {
      const creatable = await filter(availableContentTypes, (ct) =>
        canPerformActionOnEntryOfType('create', ct.sys.id),
      );
      // Important as `filter` creates a new array and otherwise always a "new value" would be written to the state
      setCreatableContentTypes((creatableContentTypes) =>
        isEqual(creatable, creatableContentTypes) ? creatableContentTypes : creatable,
      );
    }

    if (availableContentTypes.length > 0) {
      void checkContentTypeAccess();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO: Evaluate the dependencies
  }, [availableContentTypes]);

  return {
    creatableContentTypes,
    availableContentTypes,
  };
}
