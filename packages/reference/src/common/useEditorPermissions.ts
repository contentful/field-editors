import { useEffect, useMemo, useState } from 'react';

import { FieldAPI } from '@contentful/app-sdk';

import { ContentType, ContentEntityType, FieldAppSDK } from '../types';
import { fromFieldValidations } from '../utils/fromFieldValidations';
import { ReferenceEditorProps } from './ReferenceEditor';
import { useAccessApi } from './useAccessApi';
import { useContentTypePermissions } from './useContentTypePermissions';

// Type for Array fields that have an items property with validations
type ArrayFieldAPI = FieldAPI & {
  items?: { validations?: unknown[] };
};

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
  // Extract validations with proper typing for dependency tracking
  // This ensures useMemo recalculates when validations change, even on page refresh
  const fieldValidations = sdk.field.validations;
  const itemsValidations =
    sdk.field.type === 'Array' ? (sdk.field as ArrayFieldAPI).items?.validations : undefined;

  const validations = useMemo(
    () => fromFieldValidations(sdk.field),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fieldValidations and itemsValidations ARE necessary. sdk.field is a stable object reference, but sdk.field.validations can change after page refresh. We track the validation arrays to recalculate when they're populated asynchronously. Important to use stringify to prevent re-render through React.is
    [sdk.field, JSON.stringify(fieldValidations), JSON.stringify(itemsValidations)],
  );

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
