/* eslint-env node */
module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Ensure that a translation key follows the naming convention',
      category: 'Best Practices',
    },
    schema: [],
    fixable: 'code',
    messages: {
      missingId: 'The "id" is required.',
      idMustBeString: 'The "id" should be a string.',
      tooManySegments: 'The "id" has too many segments. It should have exactly 4 segments.',
      tooFewSegments: 'The "id" has too few segments. It should have exactly 4 segments.',
      invalidIdFormat:
        'The "id" must follow the format: UI.Page/Feature.Section.Element or F36.Page/Feature.Section.Element and use PascalCase for all parts.',
      f36NotAllowed:
        'The "F36" project prefix is only allowed when used in files under src/javascripts/core/components.',
    },
  },

  create(context) {
    const VALID_PROJECTS = ['FieldEditors'];
    const idPattern =
      /^(FieldEditors)\.([A-Z][a-zA-Z0-9]*)\.([A-Z][a-zA-Z0-9]*)\.([A-Z][a-zA-Z0-9]*)$/;

    // Track any aliases used for the `t` function
    const linguiTNames = new Set();
    // Track any aliases used for the `Trans` component imported from @lingui/react
    const transComponentNames = new Set();
    // Track any aliases used for the `Trans` component imported from @lingui/react/macro
    const transMacroComponentNames = new Set();
    // Track any aliases used for the `Plural` component macro
    const pluralComponentNames = new Set();

    // Helper to check if file is in core/components
    const isCoreComponentFile = context.getFilename().includes('/src/javascripts/core/components/');

    const toPascalCase = (str) =>
      str
        .replace(/[^a-zA-Z0-9]/g, ' ')
        .split(/[\s-_]+/)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join('');

    /**
     * Validates the ID value and reports appropriate errors or fixes
     * @param {ASTNode} node - The node to report errors on
     * @param {string} rawValue - The ID string to validate
     * @param {function} uiFixerCb - A callback for UI fixer if autofix is possible
     * @param {function} f36FixerCb - A callback for F36 fixer if autofix is possible
     */
    const validateId = (node, rawValue, uiFixerCb, f36FixerCb) => {
      // Pass if valid
      if (idPattern.test(rawValue)) {
        // If F36, only allow in core/components
        if (rawValue.startsWith('F36.') && !isCoreComponentFile) {
          context.report({
            node,
            messageId: 'f36NotAllowed',
          });
        }
        return;
      }

      const parts = rawValue.split('.');
      if (parts.length !== 4) {
        // Too few or too many segments
        context.report({
          node,
          messageId: parts.length < 4 ? 'tooFewSegments' : 'tooManySegments',
        });
        return;
      }

      const [project] = parts;
      if (!VALID_PROJECTS.includes(project)) {
        context.report({ node, messageId: 'invalidIdFormat' });
        return;
      }

      context.report({
        node,
        messageId: 'invalidIdFormat',
        fix: project === 'F36' ? f36FixerCb : uiFixerCb,
      });
    };

    return {
      // Track imports to handle aliasing
      ImportDeclaration(node) {
        if (node.source.value === '@lingui/core/macro') {
          node.specifiers.forEach((spec) => {
            if (spec.imported.name === 't') {
              linguiTNames.add(spec.local.name);
            }
          });
        }
        if (node.source.value === '@lingui/react') {
          node.specifiers.forEach((spec) => {
            if (spec.imported.name === 'Trans') {
              transComponentNames.add(spec.local.name);
            }
          });
        }
        if (node.source.value === '@lingui/react/macro') {
          node.specifiers.forEach((spec) => {
            if (spec.imported.name === 'Trans') {
              transMacroComponentNames.add(spec.local.name);
            }
            if (spec.imported.name === 'Plural') {
              pluralComponentNames.add(spec.local.name);
            }
          });
        }
      },

      // Validate t({ id: '...' }) calls
      CallExpression(node) {
        const callee = node.callee;
        if (!callee || !linguiTNames.has(callee.name) || node.arguments.length !== 1) return;

        const arg = node.arguments[0];
        if (arg.type !== 'ObjectExpression') return;

        const idProp = arg.properties.find((p) => p.type === 'Property' && p.key.name === 'id');
        if (!idProp) {
          context.report({ node: arg, messageId: 'missingId' });
          return;
        }
        if (idProp.value.type !== 'Literal' || typeof idProp.value.value !== 'string') {
          context.report({ node: arg, messageId: 'idMustBeString' });
          return;
        }
        const idValue = idProp.value.value;
        const parts = idValue.split('.');

        validateId(
          idProp.value,
          idValue,
          (fixer) => {
            // UI fixer
            const fixedId = ['UI', ...parts.slice(1).map(toPascalCase)].join('.');
            return fixer.replaceText(idProp.value, `'${fixedId}'`);
          },
          (fixer) => {
            // F36 fixer
            const fixedId = ['F36', ...parts.slice(1).map(toPascalCase)].join('.');
            return fixer.replaceText(idProp.value, `'${fixedId}'`);
          },
        );
      },

      // Validate <Trans id="..." /> and <Plural id="..." /> usages
      JSXOpeningElement(node) {
        const tag = node.name;
        if (!tag) return;

        const isTransComponent =
          transComponentNames.has(tag.name) || transMacroComponentNames.has(tag.name);
        const isPluralComponent = pluralComponentNames.has(tag.name);

        if (!isTransComponent && !isPluralComponent) return;

        // For Trans components, check if they're within Plural props before requiring ID
        if (isTransComponent) {
          // Walk up the AST to find if we're inside a Plural component's attribute
          let ancestor = node.parent;
          let withinPluralProps = false;

          while (ancestor) {
            // Pattern: JSXElement -> JSXExpressionContainer -> JSXAttribute -> JSXOpeningElement (Plural)
            if (
              ancestor.type === 'JSXExpressionContainer' &&
              ancestor.parent &&
              ancestor.parent.type === 'JSXAttribute' &&
              ancestor.parent.parent &&
              ancestor.parent.parent.type === 'JSXOpeningElement' &&
              ancestor.parent.parent.name &&
              ancestor.parent.parent.name.type === 'JSXIdentifier' &&
              pluralComponentNames.has(ancestor.parent.parent.name.name)
            ) {
              withinPluralProps = true;
              break;
            }
            ancestor = ancestor.parent;
          }

          // Skip ID validation if Trans is within Plural props
          if (withinPluralProps) {
            return;
          }
        }

        // Look for the id="..." attribute
        const idAttr = node.attributes.find(
          (attr) => attr.type === 'JSXAttribute' && attr.name.name === 'id',
        );

        // Report if `id` is missing entirely
        if (!idAttr || !idAttr.value) {
          context.report({ node, messageId: 'missingId' });
          return;
        }
        if (idAttr.value.type !== 'Literal' || typeof idAttr.value.value !== 'string') {
          context.report({ node, messageId: 'idMustBeString' });
          return;
        }
        const idValue = idAttr.value.value;
        const parts = idValue.split('.');

        validateId(
          idAttr.value,
          idValue,
          (fixer) => {
            // UI fixer
            const fixedId = ['UI', ...parts.slice(1).map(toPascalCase)].join('.');
            return fixer.replaceText(idAttr.value, `"${fixedId}"`);
          },
          (fixer) => {
            // F36 fixer
            const fixedId = ['F36', ...parts.slice(1).map(toPascalCase)].join('.');
            return fixer.replaceText(idAttr.value, `"${fixedId}"`);
          },
        );
      },
    };
  },
};
