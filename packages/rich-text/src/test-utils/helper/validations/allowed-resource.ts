import { Validation } from '../validation';

export function allowedResource(): Validation {
  function validate(value: any, context: any): Record<string, any>[] {
    if (value.type === 'Contentful:Entry') {
      return validateContentfulEntry(value);
    } else {
      return validateExternalResourceType(value, context);
    }
  }

  return new Validation('allowedResource', validate);
}

export function isContentfulEntryResource(resource: any): any {
  return resource.type === 'Contentful:Entry';
}

export function isExternalResource(resource: any): any {
  return (
    typeof resource.type === 'string' &&
    !resource.type.startsWith('Contentful:') &&
    // Making sure the type of the value is similar to ResourceIdentifier
    resource.type.split(':').length === 2 &&
    // Making sure provider and resource type are not empty strings
    resource.type.split(':').every((substring) => substring.length > 1)
  );
}

function validateContentfulEntry(allowedResource: any): any {
  if (!isContentfulEntryResource(allowedResource)) {
    return [{ code: 'INVALID_RESOURCE_TYPE' }];
  }
  if (!Object.prototype.hasOwnProperty.call(allowedResource, 'source')) {
    return [{ code: 'MISSING_SOURCE' }];
  }
  if (!Object.prototype.hasOwnProperty.call(allowedResource, 'contentTypes')) {
    return [{ code: 'MISSING_CONTENT_TYPES' }];
  }

  return [];
}

function validateExternalResourceType(
  allowedResource: any,
  context: { allowedExternalResourceTypes: string[] }
): Record<string, any>[] {
  // We only want to allow the type property for external resources
  if (
    Object.keys(allowedResource).length > 1 ||
    !Object.prototype.hasOwnProperty.call(allowedResource, 'type')
  ) {
    return [{ code: 'ONLY_TYPE_PROPERTY_ALLOWED' }];
  }
  if (
    isExternalResource(allowedResource) &&
    Object.keys(allowedResource).length === 1 &&
    Object.prototype.hasOwnProperty.call(allowedResource, 'type') &&
    context.allowedExternalResourceTypes &&
    context.allowedExternalResourceTypes.includes(allowedResource.type)
  ) {
    return [];
  }

  return [{ code: 'INVALID_RESOURCE_TYPE' }];
}
