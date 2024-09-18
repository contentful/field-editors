import { Validation } from '../validation';

function isResourceLink(field: any): boolean {
  return field.type === 'Array'
    ? field.items?.type === 'ResourceLink'
    : field.type === 'ResourceLink';
}

export function allowedResourcesRequired(): Validation {
  return new Validation('allowedResourcesRequired', (field: any) => {
    if (isResourceLink(field) && !field.allowedResources) {
      return [
        {
          name: 'required',
          path: ['allowedResources'],
          value: field.allowedResources,
        },
      ];
    }
    return [];
  });
}
