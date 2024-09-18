import { Block, Inline } from '@contentful/rich-text-types';
import _ from 'lodash';
import { getNodesByType } from '../utils/nodes';
import { Validation } from '../../validation';

export function allowedResources(
  allowedResourcesArg: Record<string, any>[],
  nodeType: string
): Validation {
  const allowedResources = checkAllowedResources(allowedResourcesArg);

  const test = (rootNode: Block | Inline, _context: Record<string, any>): boolean => {
    // Note that this evaluates to a lazily-evaluated lodash chain, not a
    // native JS array. That's why we're running further operations and
    // grabbing the .value() below.
    const resourceLinks = getNodesByType(_.chain(rootNode.content), nodeType).map(
      'data.target.sys'
    );
    return resourceLinks.every(Boolean).value();
  };

  return Validation.fromTestFunction('allowedResources', test, {
    allowedResources,
    type: 'nodeValidation',
  });
}

function checkAllowedResources(allowedResources: unknown): [any, ...any[]] {
  if (!Array.isArray(allowedResources)) {
    throw new TypeError('Expected Array as allowedResources validation argument');
  }

  const isValid = allowedResources.every((allowedResource: unknown): allowedResource is any => {
    if (!allowedResource || typeof allowedResource !== 'object' || Array.isArray(allowedResource)) {
      return false;
    }
    if (
      !(
        'type' in allowedResource &&
        'source' in allowedResource &&
        'contentTypes' in allowedResource
      )
    ) {
      return false;
    }
    // @TODO remove type cast
    const { type, source, contentTypes } = allowedResource as Record<string, unknown>;

    return (
      type === 'Contentful:Entry' &&
      typeof source === 'string' &&
      Array.isArray(contentTypes) &&
      contentTypes.every((contentType): contentType is string => typeof contentType === 'string')
    );
  });

  if (!isValid) {
    throw new Error('One or more items in allowedResources array are invalid');
  }

  const firstAllowedResourceItem: any | undefined = allowedResources[0];

  if (firstAllowedResourceItem === undefined) {
    throw new Error('Need at least one allowed resource configuration');
  }

  return [firstAllowedResourceItem, ...allowedResources.slice(1)];
}
