import { useEffect, useMemo, useState } from 'react';
import { useContentTypePermissions } from './useContentTypePermissions';
import { ContentType, EntityType, FieldExtensionSDK } from '../types';
import { ReferenceEditorProps } from './ReferenceEditor';
import { useAccessApi } from './useAccessApi';
import { fromFieldValidations } from '../utils/fromFieldValidations';

export type EditorPermissionsProps = {
  sdk: FieldExtensionSDK;
  entityType: EntityType;
  parameters: ReferenceEditorProps['parameters'];
  allContentTypes: ContentType[];
};

export function useEditorPermissions(props: EditorPermissionsProps) {
  const { sdk, entityType, parameters } = props;
  const validations = useMemo(() => fromFieldValidations(props.sdk.field), [props.sdk.field]);
  const [canCreateEntity, setCanCreateEntity] = useState(true);
  const [canLinkEntity, setCanLinkEntity] = useState(true);
  const {
    creatableContentTypes,
    readableContentTypes,
    availableContentTypes,
  } = useContentTypePermissions({ ...props, validations });
  const { canPerformAction } = useAccessApi(sdk.access);

  useEffect(() => {
    if (parameters.instance.showCreateEntityAction === false) {
      setCanCreateEntity(false);
      return;
    }

    async function checkCreateAccess() {
      if (entityType === 'Asset') {
        const canCreate = await canPerformAction('create', 'Asset');
        setCanCreateEntity(canCreate);
      }
      if (entityType === 'Entry') {
        setCanCreateEntity(creatableContentTypes.length > 0);
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
        const canRead = await canPerformAction('read', 'Asset');
        setCanLinkEntity(canRead);
      }
      if (entityType === 'Entry') {
        setCanLinkEntity(readableContentTypes.length > 0);
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
