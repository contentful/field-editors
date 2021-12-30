import { WithOverride, match, getPluginType } from '@udecode/plate-core';
import { Editor, NodeEntry } from 'slate';

import { transformRemove } from '../../helpers/transformers';
import { RichTextPlugin } from '../../types';
import { NormalizerRule, NodeTransformer, NodeValidator } from './types';
import { NormalizerError, createValidatorFromTypes, getChildren } from './utils';

export const withNormalizer: WithOverride = (editor) => {
  const rules: Required<NormalizerRule>[] = [];

  // Drive normalization rules from other plugin's configurations
  for (const p of editor.plugins as RichTextPlugin[]) {
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
    Editor.withoutNormalizing(editor, () => {
      tr(editor, entry);
    });
  };

  const { normalizeNode } = editor;

  editor.normalizeNode = (entry) => {
    const [node] = entry;
    const children = getChildren(editor, entry);

    // The order of validNode rules Vs validChildren doesn't matter. Slate
    // will always perform normalization in a depth-first fashion.
    for (const rule of rules) {
      if (!match(node, rule.match)) {
        continue;
      }

      // Normalize node
      if ('validNode' in rule && !rule.validNode(editor, entry)) {
        _transform(rule.transform, entry);
        return;
      }

      // Normalize node.children
      if ('validChildren' in rule) {
        // It can not be an array since we enforced it earlier
        const isValidChild = rule.validChildren as NodeValidator;

        const invalidChildEntry = children.find((entry) => !isValidChild(editor, entry));

        if (invalidChildEntry) {
          _transform(rule.transform, invalidChildEntry);
          return;
        }
      }
    }

    return normalizeNode(entry);
  };

  return editor;
};
