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
    arr.map(async (item) => ((await predicate(item)) ? item : fail))
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
    if (entityType === 'Asset') {
      return [];
    }

    if (validations.contentTypes) {
      return allContentTypes.filter((ct) => validations.contentTypes?.includes(ct.sys.id));
    }

    return allContentTypes;
  }, [allContentTypes, validations.contentTypes, entityType]);

  const [creatableContentTypes, setCreatableContentTypes] = useState(availableContentTypes);
  const { canPerformActionOnEntryOfType } = useAccessApi(sdk.access);

  useEffect(() => {
    function getContentTypes(action: 'create' | 'read') {
      return filter(availableContentTypes, (ct) =>
        canPerformActionOnEntryOfType(action, ct.sys.id)
      );
    }

    async function checkContentTypeAccess() {
      const creatable = await getContentTypes('create');
      // Important as `filter` creates a new array and otherwise always a "new value" would be written to the state
      if (!isEqual(creatable, creatableContentTypes)) {
        setCreatableContentTypes(creatable);
      }
    }

    if (availableContentTypes.length > 0) {
      void checkContentTypeAccess();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO: Evaluate the dependencies
  }, [availableContentTypes, creatableContentTypes]);

  return {
    creatableContentTypes,
    availableContentTypes,
  };
}
