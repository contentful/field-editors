import { helpers, BLOCKS } from '@contentful/rich-text-types';
import { getSchemaWithNodeType } from '@contentful/rich-text-types/dist/schemas';
import Ajv, { ErrorObject } from 'ajv';

const ajv = new Ajv({ allErrors: true, verbose: true });

export function validateRichTextDocument(document) {
  const validateRootNode = getValidator(BLOCKS.DOCUMENT);
  const rootNodeIsValid = validateRootNode(removeGrandChildNodes(document));

  const errors = [];

  if (rootNodeIsValid) {
    validateChildNodes(document, ['content'], errors);
  } else {
    buildSchemaErrors(validateRootNode, [], errors);
  }

  return errors;
}

function validateChildNodes(node, path, errors) {
  for (let i = 0; i < node.content.length; i++) {
    validateNode(node.content[i], [...path, i], errors);
  }
}

function validateNode(node, path, errors) {
  const validateSchema = getValidator(node.nodeType);
  const isValid = validateSchema(removeGrandChildNodes(resetChildNodes(node)));
  if (!isValid) {
    buildSchemaErrors(validateSchema, path, errors);
    return;
  }

  if (!isLeafNode(node)) {
    validateChildNodes(node, [...path, 'content'], errors);
  }
}

function getValidator(nodeType) {
  const schema = getSchemaWithNodeType(nodeType);

  return ajv.compile(schema);
}

function buildSchemaErrors(validateSchema, _, errors) {
  const schemaErrors: ErrorObject[] = validateSchema.errors;
  const constraintError = schemaErrors.find((e) => e.keyword === 'enum' || e.keyword === 'anyOf');
  if (constraintError) {
    errors.push(constraintError);
    return;
  }
  errors.push(...schemaErrors);
}

function resetChildNodes(node) {
  const { content } = node;
  if (isLeafNode(node)) {
    return node;
  }
  return Object.assign({}, node, { content: content.map(resetNode) });
}

function resetNode(node) {
  const { nodeType } = node;
  if (helpers.isText(node)) {
    return { nodeType, data: {}, value: '', marks: [] };
  }
  return { nodeType, data: {}, content: [] };
}

function removeGrandChildNodes(node) {
  const { content } = node;
  if (isLeafNode(node)) {
    return node;
  }
  return Object.assign({}, node, { content: content.map(removeChildNodes) });
}

function removeChildNodes(node) {
  if (helpers.isText(node)) {
    return node;
  }
  return Object.assign({}, node, { content: [] });
}

function isLeafNode(node) {
  return helpers.isText(node) || !Array.isArray(node.content);
}
