function convertPath(instancePath) {
  if (typeof instancePath !== 'string' || instancePath.length < 1) {
    return [];
  }

  const [, ...subPaths] = instancePath.split('/').map((part) => {
    const isNumeric = /^\d+$/.test(part);
    if (isNumeric) {
      return parseInt(part, 10);
    }
    return part;
  });

  return subPaths;
}

function getPath(ajvError) {
  const { instancePath, params } = ajvError;
  const isMissingProperty = 'missingProperty' in params;
  const isAdditionalProperty = 'additionalProperty' in params;
  if (isMissingProperty || isAdditionalProperty) {
    const hasPath = instancePath.length > 0;
    const property = params.missingProperty || params.additionalProperty;

    if (!hasPath) {
      return [property];
    }
    return convertPath(instancePath).concat(property);
  }

  return convertPath(instancePath);
}

const requiresOne = (schema) =>
  schema && Array.isArray(schema.required) && schema.required.length === 1;

const isUnless = (schema) =>
  Array.isArray(schema) && schema.length === 2 && schema.every(requiresOne);

const upperFirst = (str) => str.charAt(0).toUpperCase() + str.slice(1);

const getTypeFromAjvError = (ajvError) => {
  let type = ajvError.params.type;
  if (Array.isArray(ajvError.params.type)) {
    [type] = ajvError.params.type.filter((type) => type !== 'null');
  }

  return upperFirst(type);
};

const errorMessages = {
  stringLength(ajvError) {
    const parentSchema = ajvError.parentSchema;
    const hasMin = 'minLength' in parentSchema;
    const hasMax = 'maxLength' in parentSchema;
    const hasMinMax = hasMin && hasMax;

    if (hasMinMax) {
      return `Size must be at least ${parentSchema.minLength} and at most ${parentSchema.maxLength}`;
    } else if (hasMin) {
      return `Size must be at least ${parentSchema.minLength}`;
    }
    return `Size must be at most ${parentSchema.maxLength}`;
  },

  arrayLength(ajvError) {
    const parentSchema = ajvError.parentSchema;
    const hasMin = 'minItems' in parentSchema;
    const hasMax = 'maxItems' in parentSchema;
    const hasMinMax = hasMin && hasMax;

    if (hasMinMax) {
      return `Size must be at least ${parentSchema.minItems} and at most ${parentSchema.maxItems}`;
    } else if (hasMin) {
      return `Size must be at least ${parentSchema.minItems}`;
    }
    return `Size must be at most ${parentSchema.maxItems}`;
  },

  propertyRequired(ajvError) {
    return `The property "${ajvError.params.missingProperty}" is required here`;
  },

  patternMatchFailed(ajvError) {
    return `Does not match /${ajvError.params.pattern}/`;
  },

  typeMismatch(ajvError) {
    const expectedType = getTypeFromAjvError(ajvError);
    return `The type of "${ajvError.instancePath
      .split('/')
      .pop()}" is incorrect, expected type: ${expectedType}`;
  },

  propertyUnknown(ajvError) {
    return `The property "${ajvError.params.additionalProperty}" is not expected`;
  },

  unlessProperty(ajvError) {
    const { schema, data } = ajvError;

    if (!isUnless(schema)) {
      throw new Error('Could not convert "oneOf" JSON schema to Contentful error');
    }

    const prop1 = schema[0].required[0];
    const prop2 = schema[1].required[0];

    if (data[prop1] && data[prop2]) {
      return `"${prop1}" can't be set when "${prop2}" is also set`;
    }
    return `The property "${prop1}" or "${prop2}" are required here`;
  },
  missingDependentProperty(ajvError) {
    return `The property "${ajvError.params.missingProperty}" is required if "${ajvError.params.property}" is present`;
  },
};

const omitUndefinedProps = (data) => {
  return Object.keys(data).reduce((acc, key) => {
    const val = data[key];
    return typeof val === 'undefined' ? acc : { ...acc, [key]: val };
  }, {});
};

const errorData = {
  stringLength(ajvError) {
    return omitUndefinedProps({
      value: ajvError.data,
      min: ajvError.parentSchema.minLength,
      max: ajvError.parentSchema.maxLength,
    });
  },

  arrayLength(ajvError) {
    return omitUndefinedProps({
      value: ajvError.data,
      min: ajvError.parentSchema.minItems,
      max: ajvError.parentSchema.maxItems,
    });
  },

  pattern(ajvError) {
    return {
      value: ajvError.data,
      pattern: ajvError.params.pattern,
    };
  },

  type(ajvError) {
    return {
      type: getTypeFromAjvError(ajvError),
      value: ajvError.data,
    };
  },

  enum(ajvError) {
    return {
      value: ajvError.data,
      expected: ajvError.schema,
    };
  },
};

const errorDetails = {
  required: {
    message: errorMessages.propertyRequired,
  },
  pattern: {
    message: errorMessages.patternMatchFailed,
    data: errorData.pattern,
  },
  maxLength: {
    message: errorMessages.stringLength,
    data: errorData.stringLength,
  },
  minLength: {
    message: errorMessages.stringLength,
    data: errorData.stringLength,
  },
  maxItems: {
    message: errorMessages.arrayLength,
    data: errorData.arrayLength,
  },
  minItems: {
    message: errorMessages.arrayLength,
    data: errorData.arrayLength,
  },
  minProperties: {
    message: () => 'Too few properties provided',
  },
  maxProperties: {
    message: () => 'Too many properties provided',
  },
  type: {
    message: errorMessages.typeMismatch,
    data: errorData.type,
  },
  enum: {
    message: () => 'Value must be one of expected values',
    data: errorData.enum,
  },
  anyOf: {
    message: () => 'Value must be one of expected values',
    data: errorData.enum,
  },
  additionalProperties: {
    message: errorMessages.propertyUnknown,
  },
  oneOf: {
    message: errorMessages.unlessProperty,
  },
  uniqueItems: {
    message: () => 'Items of the array must be unique',
  },
  dependencies: {
    message: errorMessages.missingDependentProperty,
  },
};

const UNKNOWN_ERROR_NAME = 'unknown';

const keywordNameMapping = {
  required: 'required',
  pattern: 'regexp',
  maxLength: 'size',
  minLength: 'size',
  maxItems: 'size',
  minItems: 'size',
  minProperties: 'size',
  maxProperties: 'size',
  type: 'type',
  enum: 'in',
  anyOf: 'in',
  additionalProperties: 'unexpected',
  oneOf: 'unless',
  uniqueItems: 'unique',
  dependencies: 'dependent_required',
};

export function toContentfulError(ajvError, rootPath = []) {
  const { keyword } = ajvError;
  const { message, data } = errorDetails[keyword] || {};

  return {
    name: keywordNameMapping[keyword] || UNKNOWN_ERROR_NAME,
    message: typeof message === 'function' ? message(ajvError) : undefined,
    path: [...rootPath, ...getPath(ajvError)],
    ...(typeof data === 'function' ? data(ajvError) : {}),
  };
}
