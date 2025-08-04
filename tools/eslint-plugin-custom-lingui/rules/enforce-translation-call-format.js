/* eslint-env node */
module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Ensure that translation calls are structured correctly',
      category: 'Best Practices',
    },
    schema: [],
    fixable: 'code',
    messages: {
      tMacroMessageMissing: 'The "message" property is required.',
      tMacroMessageMustBeStringOrPlural:
        'The "message" property must be a string, template literal, or plural call.',
      parametersMustBeObject: 'The parameters object must be an object literal.',
      pluralMacroOutsideTMacro: 'The plural macro must be used inside the t macro.',
      tMacroAsTagFunction: 'The t macro must not be called as a tag function.',
      transComponentMessageMissing: 'The "message" prop is required.',
      transComponentMessageMustBeString: 'The "message" prop must be a string.',
    },
  },
  create(context) {
    // Track any aliases used for the `t` macro
    const tImportNames = new Set();
    // Track any aliases used for the `plural` macro
    const pluralImportNames = new Set();
    // Track any aliases used for the `Trans` component
    const transImportNames = new Set();

    return {
      // Track imports to handle aliasing
      ImportDeclaration(node) {
        if (node.source.value === '@lingui/core/macro') {
          node.specifiers.forEach((spec) => {
            if (spec.imported.name === 't') {
              tImportNames.add(spec.local.name);
            } else if (spec.imported.name === 'plural') {
              pluralImportNames.add(spec.local.name);
            }
          });
        }
        if (node.source.value === '@lingui/react') {
          node.specifiers.forEach((spec) => {
            if (spec.imported.name === 'Trans') {
              transImportNames.add(spec.local.name);
            }
          });
        }
      },
      // Validate t(...) and plural(...) calls
      CallExpression(node) {
        if (isTMacroCall(node, tImportNames)) {
          if (!hasObjectLiteralAsFirstParameter(node)) {
            context.report({ node: node.arguments[0], messageId: 'parametersMustBeObject' });
            return;
          }

          const params = node.arguments[0];

          const messageProp = getMessageProperty(node);
          if (!messageProp) {
            context.report({ node: params, messageId: 'tMacroMessageMissing' });
            return;
          }
          if (!isValidTMacroMessageProperty(messageProp, pluralImportNames)) {
            context.report({ node: params, messageId: 'tMacroMessageMustBeStringOrPlural' });
            return;
          }
        } else if (isPluralMacroCall(node, pluralImportNames)) {
          if (!isMessageInTMacroCall(node, tImportNames)) {
            context.report({ node, messageId: 'pluralMacroOutsideTMacro' });
          }
        }
      },
      // Validate <Trans id="..." /> usages
      JSXOpeningElement(node) {
        const tag = node.name;
        if (!tag || !transImportNames.has(tag.name)) return;

        // Look for the message="..." prop
        const messageAttr = node.attributes.find(
          (attr) => attr.type === 'JSXAttribute' && attr.name.name === 'message',
        );

        if (!messageAttr) {
          context.report({ node, messageId: 'transComponentMessageMissing' });
          return;
        }

        if (messageAttr.value.type !== 'Literal') {
          context.report({ node, messageId: 'transComponentMessageMustBeString' });
          return;
        }
      },
      // Catch t`...` calls
      TaggedTemplateExpression(node) {
        if (!tImportNames.has(node.tag.name)) return;

        context.report({ node, messageId: 'tMacroAsTagFunction' });
      },
    };
  },
};

function isPluralMacroCall(node, pluralImportNames) {
  return node.type === 'CallExpression' && pluralImportNames.has(node.callee.name);
}

function isTMacroCall(node, tImportNames) {
  return node.type === 'CallExpression' && tImportNames.has(node.callee.name);
}

function hasObjectLiteralAsFirstParameter(node) {
  return node.arguments?.[0]?.type === 'ObjectExpression';
}

function getMessageProperty(node) {
  return node.arguments[0].properties.find(
    (p) => p.type === 'Property' && p.key.name === 'message',
  );
}

function isValidTMacroMessageProperty(property, pluralImportNames) {
  return (
    (property.value.type === 'CallExpression' &&
      pluralImportNames.has(property.value.callee.name)) ||
    ['Literal', 'TemplateLiteral'].includes(property.value.type)
  );
}

function isMessageInTMacroCall(node, tImportNames) {
  return (
    node.parent.type === 'Property' &&
    node.parent.key.type === 'Identifier' &&
    node.parent.key.name === 'message' &&
    node.parent.parent.type === 'ObjectExpression' &&
    isTMacroCall(node.parent.parent.parent, tImportNames)
  );
}
