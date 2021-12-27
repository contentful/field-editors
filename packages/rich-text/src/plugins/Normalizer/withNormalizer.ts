import { Editor, NodeEntry } from 'slate';
import { WithOverride, match, PlateEditor, getPluginType } from '@udecode/plate-core';

import { RichTextPlugin } from '../../types';
import { transformRemove } from '../../helpers/transformers';
import { NormalizerError, createValidatorFromArray, getChildren } from './utils';
import { ValidNodeRule, ValidChildrenRule, NormalizationTransformer } from './types';

export const withNormalizer: WithOverride = (editor) => {
  const validNodeRules: Required<ValidNodeRule>[] = [];
  const validChildrenRules: Required<ValidChildrenRule>[] = [];

  // Drive normalization rules from other plugin's configurations
  for (const p of editor.plugins as RichTextPlugin[]) {
    const { normalizer: rules } = p;

    if (!rules) {
      continue;
    }

    for (const rule of rules) {
      if (!rule.match && !p.isElement) {
        throw new NormalizerError('rule.match MUST be defined in a non-element plugin');
      }

      // By default we filter elements with given plugin type
      if (!rule.match) {
        rule.match = {
          type: getPluginType(editor, p.key),
        };
      }

      if (!rule.transform) {
        rule.transform = transformRemove;
      }

      if ('validNode' in rule) {
        validNodeRules.push(rule as Required<ValidNodeRule>);
      }

      if ('validChildren' in rule) {
        if (Array.isArray(rule.validChildren)) {
          rule.validChildren = createValidatorFromArray(rule.validChildren);
        }

        validChildrenRules.push(rule as Required<ValidChildrenRule>);
      }
    }
  }

  // Wrap transformer in a withoutNormalizing() call to avoid unnecessary
  // normalization cycles.
  const _transform = (tr: NormalizationTransformer, entry: NodeEntry) => {
    Editor.withoutNormalizing(editor, () => {
      tr(editor, entry);
    });
  };

  const { normalizeNode } = editor;

  editor.normalizeNode = (entry) => {
    const [node] = entry;

    // 1) Validate Nodes
    // Normalize nodes before their children to ensure that we have the final
    // structure before children transformation e.g. turning some into text
    for (const rule of validNodeRules) {
      if (!match(node, rule.match)) {
        continue;
      }

      if (!rule.validNode(editor, entry)) {
        _transform(rule.transform, entry);
        return;
      }
    }

    // 2) Validate node's children
    const children = getChildren(editor, entry);

    for (const rule of validChildrenRules) {
      if (!match(node, rule.match)) {
        continue;
      }

      // It can not be an array since we enforced it earlier
      const isValidChild = rule.validChildren as (e: PlateEditor, er: NodeEntry) => boolean;

      const invalidChildEntry = children.find((entry) => !isValidChild(editor, entry));

      if (invalidChildEntry) {
        _transform(rule.transform, invalidChildEntry);
        return;
      }
    }

    return normalizeNode(entry);
  };

  return editor;
};
