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
        'The "id" must follow the format: FieldEditors.Page/Feature.Section.Element and use PascalCase for all parts.',
    },
  },

  create(context) {
    const VALID_PROJECT = 'FieldEditors';

    // Regex to match valid IDs like FieldEditors.Page.Feature.Element
    const idPattern =
      /^FieldEditors\.([A-Z][a-zA-Z0-9]*)\.([A-Z][a-zA-Z0-9]*)\.([A-Z][a-zA-Z0-9]*)$/;

    // Track any aliases used for the `t` function
    let linguiTNames = new Set();
    // Track any aliases used for the `Trans` component
    let transNames = new Set();

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
     * @param {function} fixerCb - A callback for fixer if autofix is possible
     */
    const validateId = (node, rawValue, fixerCb) => {
      // Pass if valid
      if (idPattern.test(rawValue)) return;

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
      if (project !== VALID_PROJECT) {
        // Invalid project segment
        context.report({ node, messageId: 'invalidIdFormat' });
        return;
      }

      // Valid number of segments but wrong format — suggest fix
      context.report({
        node,
        messageId: 'invalidIdFormat',
        fix: fixerCb,
      });
    };

    return {
      // Track imports to handle aliasing
      ImportDeclaration(node) {
        if (node.source.value === '@lingui/core/macro') {
          node.specifiers.forEach((spec) => {
            if (spec.imported.name === 't') {
              linguiTNames.add(spec.local.name); // Add alias or original
            }
          });
        }

        if (node.source.value === '@lingui/react') {
          node.specifiers.forEach((spec) => {
            if (spec.imported.name === 'Trans') {
              transNames.add(spec.local.name); // Add alias or original
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

        // Find `id` property
        const idProp = arg.properties.find((p) => p.type === 'Property' && p.key.name === 'id');

        // Report if `id` is missing entirely
        if (!idProp) {
          context.report({ node: arg, messageId: 'missingId' });
          return;
        }

        if (idProp.value.type !== 'Literal' || typeof idProp.value.value !== 'string') {
          context.report({ node: arg, messageId: 'idMustBeString' });
          return;
        }

        const idValue = idProp.value.value;

        // Validate or fix the ID value
        validateId(idProp.value, idValue, (fixer) => {
          const fixedId = [VALID_PROJECT, ...idValue.split('.').slice(1).map(toPascalCase)].join(
            '.',
          );
          return fixer.replaceText(idProp.value, `'${fixedId}'`);
        });
      },

      // Validate <Trans id="..." /> usages
      JSXOpeningElement(node) {
        const tag = node.name;
        if (!tag || !transNames.has(tag.name)) return;

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

        // Validate or fix the ID value
        validateId(idAttr.value, idValue, (fixer) => {
          const fixedId = [VALID_PROJECT, ...idValue.split('.').slice(1).map(toPascalCase)].join(
            '.',
          );
          return fixer.replaceText(idAttr.value, `"${fixedId}"`);
        });
      },
    };
  },
};
