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
      pluralComponentPropMustBeString:
        'The "{{ prop }}" prop must be a string or template literal.',
      pluralMacroOutsideTMacro: 'The plural macro must be used inside the t macro.',
      pluralMacroArgumentMustBeString:
        'The "{{ arg }}" argument must be a string or template literal.',
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
    // Track any aliases used for the `Plural` component macro
    const pluralComponentImportNames = new Set();
    // Track any aliases used for the `Trans` component
    const transImportNames = new Set();

    const PLURAL_COMPONENT_PROPS = ['other', 'one', '_0'];
    const PLURAL_MACRO_PROPS = ['other', 'one', 0];

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
        if (node.source.value === '@lingui/react/macro') {
          node.specifiers.forEach((spec) => {
            if (spec.imported.name === 'Plural') {
              pluralComponentImportNames.add(spec.local.name);
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

          const messageProp = getMessageProperty(node);
          if (!messageProp) {
            context.report({ node: node.arguments[0], messageId: 'tMacroMessageMissing' });
            return;
          }
          if (!isValidTMacroMessageProperty(messageProp, pluralImportNames)) {
            context.report({
              node: node.arguments[0],
              messageId: 'tMacroMessageMustBeStringOrPlural',
            });
            return;
          }
        } else if (isPluralMacroCall(node, pluralImportNames)) {
          if (!isMessageInTMacroCall(node, tImportNames)) {
            context.report({ node, messageId: 'pluralMacroOutsideTMacro' });
            return;
          }
          for (const prop of PLURAL_MACRO_PROPS) {
            const arg = getPluralMacroProperty(node, prop);
            if (arg && !isValidPluralMacroMessageProperty(arg)) {
              context.report({
                node: node.arguments[1],
                messageId: 'pluralMacroArgumentMustBeString',
                data: { arg },
              });
            }
          }
        }
      },
      // Validate <Trans id="..." /> and <Plural id="..." /> usages
      JSXOpeningElement(node) {
        const tag = node.name;
        if (!tag) return;

        if (transImportNames.has(tag.name)) {
          const messageProp = getComponentProp(node, 'message');
          if (!messageProp) {
            context.report({ node, messageId: 'transComponentMessageMissing' });
            return;
          }

          if (messageProp.value.type !== 'Literal') {
            context.report({ node, messageId: 'transComponentMessageMustBeString' });
            return;
          }
        } else if (pluralComponentImportNames.has(tag.name)) {
          for (const propName of PLURAL_COMPONENT_PROPS) {
            const prop = getComponentProp(node, propName);
            if (prop && !isValidPluralComponentMessageProp(prop)) {
              context.report({
                node,
                messageId: 'pluralComponentPropMustBeString',
                data: { prop: propName },
              });
            }
          }
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

function getComponentProp(node, propName) {
  return node.attributes.find(
    (prop) => prop.type === 'JSXAttribute' && prop.name.name === propName,
  );
}

function getPluralMacroProperty(node, propName) {
  return node.arguments[1].properties.find(
    (p) => p.type === 'Property' && (p.key.name === propName || p.key.value === propName),
  );
}

function isValidTMacroMessageProperty(property, pluralImportNames) {
  return (
    (property.value.type === 'CallExpression' &&
      pluralImportNames.has(property.value.callee.name)) ||
    ['Literal', 'TemplateLiteral'].includes(property.value.type)
  );
}

function isValidPluralMacroMessageProperty(property) {
  return ['Literal', 'TemplateLiteral'].includes(property.value.type);
}

function isValidPluralComponentMessageProp(prop) {
  return (
    prop.value.type === 'Literal' ||
    (prop.value.type === 'JSXExpressionContainer' &&
      prop.value.expression.type === 'TemplateLiteral')
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
