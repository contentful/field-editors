import { useEffect, useMemo, useState } from 'react';

import { ContentType, ContentEntityType, FieldAppSDK } from '../types';
import { fromFieldValidations } from '../utils/fromFieldValidations';
import { ReferenceEditorProps } from './ReferenceEditor';
import { useAccessApi } from './useAccessApi';
import { useContentTypePermissions } from './useContentTypePermissions';

export type EditorPermissionsProps = {
  sdk: FieldAppSDK;
  entityType: ContentEntityType;
  parameters: ReferenceEditorProps['parameters'];
  allContentTypes: ContentType[];
};

export function useEditorPermissions({
  sdk,
  entityType,
  parameters,
  allContentTypes,
}: EditorPermissionsProps) {
  const validations = useMemo(() => fromFieldValidations(sdk.field), [sdk.field]);
  const [canCreateEntity, setCanCreateEntity] = useState(true);
  const [canLinkEntity, setCanLinkEntity] = useState(true);
  const { creatableContentTypes, availableContentTypes } = useContentTypePermissions({
    entityType,
    validations,
    sdk,
    allContentTypes,
    parameters,
  });
  const { canPerformAction } = useAccessApi(sdk.access);

  useEffect(() => {
    if (parameters.instance.showCreateEntityAction === false) {
      setCanCreateEntity(false);
      return;
    }

    async function checkCreateAccess() {
      if (entityType === 'Asset') {
        // Hardcoded `true` value following https://contentful.atlassian.net/browse/DANTE-486
        // TODO: refine permissions check in order to account for tags in rules
        const canCreate = (await canPerformAction('create', 'Asset')) || true;
        setCanCreateEntity(canCreate);
      }
      if (entityType === 'Entry') {
        // Hardcoded `true` value following https://contentful.atlassian.net/browse/DANTE-486
        // TODO: refine permissions check in order to account for tags in rules
        const canCreate = creatableContentTypes.length > 0 || true;
        setCanCreateEntity(canCreate);
      }
    }

    void checkCreateAccess();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO: Evaluate the dependencies
  }, [entityType, parameters.instance, creatableContentTypes]);

  useEffect(() => {
    if (parameters.instance.showLinkEntityAction === false) {
      setCanLinkEntity(false);
      return;
    }

    async function checkLinkAccess() {
      if (entityType === 'Asset') {
        // Hardcoded `true` value following https://contentful.atlassian.net/browse/DANTE-486
        // TODO: refine permissions check in order to account for tags in rules
        const canRead = (await canPerformAction('read', 'Asset')) || true;
        setCanLinkEntity(canRead);
      }
      if (entityType === 'Entry') {
        // Hardcoded `true` value following https://contentful.atlassian.net/browse/DANTE-486
        // TODO: refine permissions check in order to account for tags in rules
        // TODO: always show every content type (it's just a filter) to avoid people not seeing
        // their (partly limited) content types
        const canRead = true;
        setCanLinkEntity(canRead);
      }
    }

    void checkLinkAccess();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO: Evaluate the dependencies
  }, [entityType, parameters.instance]);

  return {
    canCreateEntity,
    canLinkEntity,
    creatableContentTypes,
    availableContentTypes,
    validations,
  };
}

export type EditorPermissions = ReturnType<typeof useEditorPermissions>;
