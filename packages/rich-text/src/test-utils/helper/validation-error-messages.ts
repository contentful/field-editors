/* eslint-disable */

import _ from 'lodash';

export function exists<T>(value?: T): value is NonNullable<T> {
  return typeof value !== 'undefined' && value !== null;
}

export function pickExisting(...args: any[]): Record<string, any> {
  const collection = args.shift();

  if (args.length === 0) {
    return _.pickBy(collection, exists);
  } else {
    return _.pickBy(collection, function (value, key) {
      return exists(value) && args.indexOf(key) >= 0;
    });
  }
}

export function quote(s: string | number): string {
  return JSON.stringify(s);
}

type messageConstructor = (...args: any) => string;

const messages: { [key: string]: messageConstructor | { [key: string]: messageConstructor } } = {
  hasHostname: function () {
    return "The URL's hostname is not valid.";
  },

  referencesFieldId: function (attrName: string) {
    return 'Attribute ' + attrName + " must reference a field's id";
  },

  linkContentType: function (contentTypeId: string) {
    return 'Link must point to an Entry with the Content Type ' + contentTypeId;
  },

  isValidMimeType: function () {
    return "An asset's mime type has to be one of the allowed values.";
  },

  linkMimetypeGroup: function (mimetypeGroups: string[]) {
    return 'Link must point to an allowed file type (' + mimetypeGroups.join(', ') + ')';
  },

  assetFileSize: function (boundaries: { min: number; max: number }) {
    return 'File size must be' + boundaryMessage(boundaries.min, boundaries.max, humanizeByteSize);
  },

  assetImageDimensions: function () {
    return 'Image asset must satisfy dimensions bounds';
  },

  size: function (boundaries: { min: number; max: number }) {
    return 'Size must be' + boundaryMessage(boundaries.min, boundaries.max);
  },

  range: function (boundaries: { min: number; max: number }) {
    return 'Value must be' + boundaryMessage(boundaries.min, boundaries.max);
  },

  dateRange: {
    ERANGE: function () {
      return 'Date is not in range';
    },

    EINVALIDDATE: function () {
      return 'Provided value cannot be converted to a time';
    },
  },

  regexp: function (params: { pattern: string }) {
    return 'Does not match /' + params.pattern + '/';
  },

  linkField: function () {
    return 'This property must be a Link';
  },

  validationDefined: function (_params: any, details: { name: string; type: string }) {
    const name = details.name;
    const fieldType = details.type;
    return fieldType + ' fields do not support ' + quote(name) + ' validations';
  },

  uniqueFieldIds: function () {
    return 'Field id must be unique';
  },

  uniqueFieldApiNames: function () {
    return 'Field apiName must be unique';
  },

  matchingDefaultFieldValueType: function () {
    return 'Default values must match the field type';
  },

  allowedDefaultValueFieldType: function () {
    return 'The field type does not support "defaultValue"';
  },

  allowedResourcesRequired: function () {
    return 'The property "allowedResources" is required here';
  },

  allowedResources: (contentTypeId: string) => {
    if (contentTypeId) {
      return 'ResourceLink must point to an Entry with the Content Type ' + contentTypeId;
    }
    return 'Missing allowed resource for field';
  },
  allowedResource: {
    MISSING_SOURCE: function () {
      return `Property 'source' is required here`;
    },

    MISSING_CONTENT_TYPES: function () {
      return `Property 'contentTypes' is required here`;
    },

    INVALID_RESOURCE_TYPE: function () {
      return `Invalid resource type`;
    },
    ONLY_TYPE_PROPERTY_ALLOWED: function () {
      return `Only property 'type' is allowed here`;
    },
  },
};

function isFunctionMap(
  errorMessage: messageConstructor | { [key: string]: messageConstructor }
): errorMessage is { [key: string]: messageConstructor } {
  return !_.isFunction(errorMessage);
}

export function getErrorMessage({
  name,
  code,
  params,
  details = {},
}: {
  name: string;
  code?: string;
  params?: Record<string, any> | string;
  details?: Record<string, any>;
}): string | null {
  const createMessage = messages[name];

  if (_.isFunction(createMessage)) {
    return createMessage(params, details);
  }

  if (isFunctionMap(createMessage) && code && code in createMessage) {
    return createMessage[code](params, details);
  }

  return null;
}

const byteSizes: { [key: string]: number } = {
  ' bytes': 1,
  KB: 1024,
  MB: 1024 * 1024,
  GB: 1024 * 1024 * 1024,
};

function humanizeByteSize(size: number): string {
  const scaleKey = _.findLastKey(byteSizes, (value) => size >= value) ?? ' bytes';
  return `${size / byteSizes[scaleKey]}${scaleKey}`;
}

function boundaryMessage(min: number, max: number, numberConverter?: any): string {
  numberConverter = numberConverter || _.identity;
  let details = '';

  if (exists(min)) {
    details += ' at least ' + numberConverter(min);
  }

  if (exists(max)) {
    if (exists(min)) {
      details += ' and';
    }
    details += ' at most ' + numberConverter(max);
  }

  return details;
}
