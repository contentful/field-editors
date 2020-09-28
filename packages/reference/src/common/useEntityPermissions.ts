import { useEffect, useState } from 'react';
import { FieldExtensionSDK, EntityType } from '../types';
import { ReferenceEditorProps } from './ReferenceEditor';

export function useEntityPermissions({
  sdk,
  entityType,
  parameters,
}: {
  sdk: FieldExtensionSDK;
  entityType: EntityType;
  parameters: ReferenceEditorProps['parameters'];
}) {
  const [canCreate, setCanCreate] = useState(true);

  useEffect(() => {
    if (entityType === 'Asset') {
      sdk.access.can('create', 'Asset').then((value) => {
        setCanCreate(value);
      });
    }
  }, []);

  const canCreateEntity = () => {
    if (parameters.instance.showCreateEntityAction === false) {
      return false;
    }
    return canCreate;
  };
  const canLinkEntity = () => {
    if (parameters.instance.showLinkEntityAction !== undefined) {
      return parameters.instance.showLinkEntityAction;
    }
    return true;
  };

  return { canCreateEntity: canCreateEntity(), canLinkEntity: canLinkEntity() };
}
