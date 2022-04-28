import { useEffect, useMemo, useState } from 'react';
import { useContentTypePermissions } from './useContentTypePermissions';
import { ContentType, ContentEntityType, FieldExtensionSDK } from '../types';
import { ReferenceEditorProps } from './ReferenceEditor';
import { useAccessApi } from './useAccessApi';
import { fromFieldValidations } from '../utils/fromFieldValidations';

export type EditorPermissionsProps = {
  sdk: FieldExtensionSDK;
  entityType: ContentEntityType;
  parameters: ReferenceEditorProps['parameters'];
  allContentTypes: ContentType[];
};

export function useEditorPermissions(props: EditorPermissionsProps) {
  const { sdk, entityType, parameters } = props;
  const validations = useMemo(() => fromFieldValidations(props.sdk.field), [props.sdk.field]);
  const [canCreateEntity, setCanCreateEntity] = useState(true);
  const [canLinkEntity, setCanLinkEntity] = useState(true);
  const { creatableContentTypes, readableContentTypes, availableContentTypes } =
    useContentTypePermissions({ ...props, validations });
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
        const canCreate = readableContentTypes.length > 0 || true;
        setCanCreateEntity(canCreate);
      }
    }

    void checkCreateAccess();
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
        const canRead = readableContentTypes.length > 0 || true;
        setCanLinkEntity(canRead);
      }
    }

    void checkLinkAccess();
  }, [entityType, parameters.instance, readableContentTypes]);

  return {
    canCreateEntity,
    canLinkEntity,
    creatableContentTypes,
    readableContentTypes,
    availableContentTypes,
    validations,
  };
}

export type EditorPermissions = ReturnType<typeof useEditorPermissions>;
