import { PlateEditor, NodeMatch } from '@udecode/plate-core';
import { NodeEntry } from 'slate';

export type NodeTransformer = (editor: PlateEditor, entry: NodeEntry) => void;
export type NodeValidator = (editor: PlateEditor, entry: NodeEntry) => boolean;

type BaseRule = {
  /**
   * A helper to return a Node to which valid* rules are applied
   * against.
   *
   * By default it returns only Elements of type `plugin.type`.
   */
  match?: NodeMatch;

  /**
   * A helper to normalize invalid Node(s). By default it removes
   * invalid nodes.
   *
   * The call to this function is automatically wrapped in a
   * `Editor.withoutNormalization()` call to avoid unnecessary
   * normalization cycles.
   */
  transform?: NodeTransformer;
};

export type ValidNodeRule = BaseRule & {
  /**
   * Checks if matching Node(s) are valid.
   */
  validNode: NodeValidator;
};

export type ValidChildrenRule = BaseRule & {
  /**
   * Checks if matching Node's children are valid.
   *
   * The value can be an array of strings as a shorthand to indicate
   * valid children types.
   */
  validChildren: NodeValidator | string[];
};

export type NormalizerRule = ValidNodeRule | ValidChildrenRule;
