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
        'The "{{ prop }}" prop must be a string, template literal or "Trans" component macro.',
      pluralMacroOutsideTMacro: 'The plural macro must be used inside the t macro.',
      pluralMacroArgumentMustBeString:
        'The "{{ arg }}" argument must be a string or template literal.',
      tMacroAsTagFunction: 'The t macro must not be called as a tag function.',
      transComponentMessageMissing: 'The "message" prop is required.',
      transComponentMessageMustBeString: 'The "message" prop must be a string.',
      noCoreMacroInsideTrans:
        'Do not use "t" or "plural" from "@lingui/core/macro" inside "Trans" components — Use only the "Trans" or the "Plural" (if plural is required) components from "@lingui/react/macro" instead.',
      pluralMacroZeroNotAllowed:
        'Do not use numeric key 0 or [0] in the plural macro function. \n- For React code, use the "Plural" macro component with the "_0" key.\n- For non-React code, add a conditional check to render the "t" macro function for the zero message, and "t" + "plural" macro functions for the one/other messages.',
    },
  },
  create(context) {
    // Track any aliases used for the `t` macro
    const tImportNames = new Set();
    // Track any aliases used for the `plural` macro
    const pluralImportNames = new Set();
    // Track any aliases used for the `Plural` component macro
    const pluralComponentImportNames = new Set();
    // Track any aliases used for the `Trans` component imported from @lingui/react
    const transComponentImportNames = new Set();
    // Track any aliases used for the `Trans` component imported from @lingui/react/macro
    const transMacroComponentImportNames = new Set();

    const PLURAL_COMPONENT_PROPS = ['other', 'one', '_0'];
    const PLURAL_MACRO_PROPS = ['other', 'one'];

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
              transComponentImportNames.add(spec.local.name);
            }
          });
        }
        if (node.source.value === '@lingui/react/macro') {
          node.specifiers.forEach((spec) => {
            if (spec.imported.name === 'Plural') {
              pluralComponentImportNames.add(spec.local.name);
            }
            if (spec.imported.name === 'Trans') {
              transMacroComponentImportNames.add(spec.local.name);
            }
          });
        }
      },
      // Validate t(...) and plural(...) calls
      CallExpression(node) {
        // Prevent using core/macro t or plural inside Trans children
        if (
          (isTMacroCall(node, tImportNames) || isPluralMacroCall(node, pluralImportNames)) &&
          isInTransComponent(node, transMacroComponentImportNames)
        ) {
          context.report({ node, messageId: 'noCoreMacroInsideTrans' });
          return;
        }

        if (isTMacroCall(node, tImportNames)) {
          if (!hasObjectLiteralAsFirstParameter(node)) {
            context.report({ node: node.arguments[0], messageId: 'parametersMustBeObject' });
            return;
          }

          const messageProperty = getMessageProperty(node);
          if (!messageProperty) {
            context.report({ node: node.arguments[0], messageId: 'tMacroMessageMissing' });
            return;
          }
          if (!isValidTMacroMessageProperty(messageProperty, pluralImportNames)) {
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
          for (const property of PLURAL_MACRO_PROPS) {
            const arg = getPluralMacroProperty(node, property);
            if (arg && !isValidPluralMacroMessageProperty(arg)) {
              context.report({
                node: node.arguments[1],
                messageId: 'pluralMacroArgumentMustBeString',
                data: { arg },
              });
            }
          }

          // Disallow numeric 0 keys (either `0` or computed `[0]`) in plural macro object
          const pluralArguments = node.arguments?.[1];
          if (pluralArguments && pluralArguments.type === 'ObjectExpression') {
            for (const property of pluralArguments.properties) {
              const key = property.key;
              const isZeroLiteral = key && key.type === 'Literal' && key.value === 0;
              const isZeroIdentifier = key && key.type === 'Identifier' && key.name === '0';

              if (isZeroLiteral || isZeroIdentifier) {
                context.report({
                  node: property,
                  messageId: 'pluralMacroZeroNotAllowed',
                });
              }
            }
          }
        }
      },
      // Validate <Trans id="..." /> and <Plural id="..." /> usages
      JSXOpeningElement(node) {
        const tag = node.name;
        if (!tag) return;

        if (transComponentImportNames.has(tag.name)) {
          const messageProperty = getComponentProperty(node, 'message');
          if (!messageProperty) {
            context.report({ node, messageId: 'transComponentMessageMissing' });
            return;
          }

          if (messageProperty.value.type !== 'Literal') {
            context.report({ node, messageId: 'transComponentMessageMustBeString' });
            return;
          }
        } else if (pluralComponentImportNames.has(tag.name)) {
          for (const propertyName of PLURAL_COMPONENT_PROPS) {
            const property = getComponentProperty(node, propertyName);
            if (
              property &&
              !isValidPluralComponentMessageProperty(property, transMacroComponentImportNames)
            ) {
              context.report({
                node,
                messageId: 'pluralComponentPropMustBeString',
                data: { prop: propertyName },
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
    (property) => property.type === 'Property' && property.key.name === 'message',
  );
}

function getComponentProperty(node, propertyName) {
  return node.attributes.find(
    (property) => property.type === 'JSXAttribute' && property.name.name === propertyName,
  );
}

function getPluralMacroProperty(node, propertyName) {
  return node.arguments[1].properties.find(
    (property) =>
      property.type === 'Property' &&
      (property.key.name === propertyName || property.key.value === propertyName),
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

function isValidPluralComponentMessageProperty(property, transMacroComponentImportNames) {
  return (
    property.value.type === 'Literal' ||
    (property.value.type === 'JSXExpressionContainer' &&
      property.value.expression.type === 'TemplateLiteral') ||
    (property.value.type === 'JSXExpressionContainer' &&
      property.value.expression.type === 'JSXElement' &&
      transMacroComponentImportNames.has(property.value.expression?.openingElement?.name?.name))
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

function isInTransComponent(node, transMacroComponentImportNames) {
  if (!node) return false;

  if (node.type === 'JSXExpressionContainer' && node.parent && node.parent.type === 'JSXElement') {
    const opening = node.parent.openingElement;

    if (!opening || !opening.name) {
      return false;
    }

    const functionName = opening.name;
    const tOrPluralCall = functionName.name;

    if (transMacroComponentImportNames.has(tOrPluralCall)) {
      return true;
    }
  }

  return isInTransComponent(node.parent, transMacroComponentImportNames);
}
