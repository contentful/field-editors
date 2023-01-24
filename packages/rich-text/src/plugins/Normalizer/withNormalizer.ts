import isPlainObject from 'is-plain-obj';

import { transformRemove } from '../../helpers/transformers';
import { withoutNormalizing } from '../../internal';
import { getChildren, matchNode, getPluginType } from '../../internal/queries';
import { PlateEditor, PlatePlugin, NodeEntry } from '../../internal/types';
import { baseRules } from './baseRules';
import { NormalizerRule, NodeTransformer, NodeValidator } from './types';
import { NormalizerError, createValidatorFromTypes, createTransformerFromObject } from './utils';

export const withNormalizer = (editor: PlateEditor) => {
  const rules: Required<NormalizerRule>[] = baseRules;

  // Derive normalization rules from other plugin's configurations
  for (const p of editor.plugins as PlatePlugin[]) {
    const { normalizer: _rules } = p;

    if (!_rules) {
      continue;
    }

    for (const _rule of _rules) {
      // Clone to avoid mutation bugs
      const rule = { ..._rule };

      if (!rule.match && !p.isElement) {
        throw new NormalizerError('rule.match MUST be defined in a non-element plugin');
      }

      // By default we filter elements with given plugin type
      if (!rule.match) {
        rule.match = {
          type: getPluginType(editor, p.key),
        };
      }

      // Conditional transformation e.g.
      // {
      //   [BLOCKS.EMBEDDED_ASSET]: transformLift,
      //   default?: transformRemove
      // }
      //
      if (isPlainObject(rule.transform)) {
        if ('validNode' in rule) {
          // I can't think of a use case. Disabled to prevent misuse
          throw new NormalizerError(
            'conditional transformations are not supported in validNode rules'
          );
        }

        rule.transform = createTransformerFromObject({
          default: transformRemove,
          ...rule.transform,
        });
      }

      // By default all invalid nodes are removed.
      if (!rule.transform) {
        rule.transform = transformRemove;
      }

      // Convert Types array syntax to a validator function
      if ('validChildren' in rule && Array.isArray(rule.validChildren)) {
        rule.validChildren = createValidatorFromTypes(rule.validChildren);
      }

      rules.push(rule as Required<NormalizerRule>);
    }
  }

  // Wrap transformer in a withoutNormalizing() call to avoid unnecessary
  // normalization cycles.
  const _transform = (tr: NodeTransformer, entry: NodeEntry) => {
    withoutNormalizing(editor, () => {
      tr(editor, entry);
    });
  };

  const { normalizeNode } = editor;

  // @ts-expect-error
  editor.normalizeNode = (entry: NodeEntry) => {
    const [node, path] = entry;
    const children = getChildren(entry);

    // The order of validNode rules Vs validChildren doesn't matter. Slate
    // will always perform normalization in a depth-first fashion.
    for (const rule of rules) {
      if (!matchNode(node, path, rule.match)) {
        continue;
      }

      // Normalize node
      if ('validNode' in rule && !rule.validNode(editor, entry)) {
        _transform(rule.transform as NodeTransformer, entry);
        return;
      }

      // Normalize node.children
      if ('validChildren' in rule) {
        // It can not be an array since we enforced it earlier
        const isValidChild = rule.validChildren as NodeValidator;

        const invalidChildEntry = children.find((entry) => !isValidChild(editor, entry));

        if (invalidChildEntry) {
          _transform(rule.transform as NodeTransformer, invalidChildEntry);
          return;
        }
      }
    }

    return normalizeNode(entry);
  };

  return editor;
};
