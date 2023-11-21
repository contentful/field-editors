import { useEffect, useMemo, useState } from 'react';

import { ContentType, ContentEntityType, FieldAppSDK } from '../types.js';
import { ReferenceValidations } from '../utils/fromFieldValidations.js';
import { ReferenceEditorProps } from './ReferenceEditor.js';
import { useAccessApi } from './useAccessApi.js';

type ContentTypePermissionsProps = {
  sdk: FieldAppSDK;
  entityType: ContentEntityType;
  parameters: ReferenceEditorProps['parameters'];
  allContentTypes: ContentType[];
  validations: ReferenceValidations;
};

type ContentTypePermissions = {
  creatableContentTypes: ContentType[];
  readableContentTypes: ContentType[];
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

export function useContentTypePermissions(
  props: ContentTypePermissionsProps
): ContentTypePermissions {
  const availableContentTypes = useMemo(() => {
    if (props.entityType === 'Asset') {
      return [];
    }

    if (props.validations.contentTypes) {
      return props.allContentTypes.filter((ct) =>
        props.validations.contentTypes?.includes(ct.sys.id)
      );
    }

    return props.allContentTypes;
  }, [props.allContentTypes, props.validations.contentTypes, props.entityType]);
  const [creatableContentTypes, setCreatableContentTypes] = useState(availableContentTypes);
  const [readableContentTypes, setReadableContentTypes] = useState(availableContentTypes);
  const { canPerformActionOnEntryOfType } = useAccessApi(props.sdk.access);

  useEffect(() => {
    function getContentTypes(action: 'create' | 'read') {
      return filter(availableContentTypes, (ct) =>
        canPerformActionOnEntryOfType(action, ct.sys.id)
      );
    }

    async function checkContentTypeAccess() {
      const creatable = await getContentTypes('create');
      const readable = await getContentTypes('read');
      setCreatableContentTypes(creatable);
      setReadableContentTypes(readable);
    }

    void checkContentTypeAccess();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO: Evaluate the dependencies
  }, [availableContentTypes]);

  return {
    creatableContentTypes,
    readableContentTypes,
    availableContentTypes,
  };
}
