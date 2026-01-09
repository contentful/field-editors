import type { ComponentType } from 'react';

import type { FieldAppSDK } from '@contentful/app-sdk';
import type { NodeViewComponentProps } from '@handlewithcare/react-prosemirror';
import { keydownHandler } from 'prosemirror-keymap';
import type { NodeSpec } from 'prosemirror-model';
import type { Command } from 'prosemirror-state';
import { Plugin, PluginKey, EditorState } from 'prosemirror-state';
import { findParentNodeOfType } from 'prosemirror-utils';

import { lazyHandler } from './utils';

export abstract class Node extends Plugin {
  constructor(sdk: FieldAppSDK) {
    super({
      key: new PluginKey(new.target.name),
    });

    this.sdk = sdk;
  }

  /**
   * The unique name of the node. It must be alphanumeric and may contain
   * underscore characters.
   */
  abstract readonly name: string;

  abstract readonly schema: NodeSpec;

  /**
   * The Field SDK instance.
   */
  sdk: FieldAppSDK;

  /**
   * Modifiers can be given in any order. `Shift-` (or `s-`), `Alt-` (or
   * `a-`), `Ctrl-` (or `c-` or `Control-`) and `Cmd-` (or `m-` or `Meta-`)
   * are recognized. For characters that are created by holding shift, the
   * `Shift-` prefix is implied, and should not be added explicitly.
   *
   * You can use `Mod-` as a shorthand for `Cmd-` on Mac and `Ctrl-` on
   * other platforms.
   */
  shortcuts: Record<string, Command> = {};

  /**
    A set of [document decorations](https://prosemirror.net/docs/ref/#view.Decoration) to show in the
    view.
    */
  decorations: Plugin['props']['decorations'];

  /**
   * A react component to render the node view.
   */
  component?: ComponentType<NodeViewComponentProps>;

  props: Plugin['props'] = {
    handleKeyDown: lazyHandler(() => keydownHandler(this.shortcuts)),
    decorations: lazyHandler(() => this.decorations),
  };

  /**
   * Access node type from state
   */
  type = (state: Pick<EditorState, 'schema'>) => {
    return state.schema.nodes[this.name];
  };

  /**
   * Check if the current selection is inside a node of this type.
   */
  isActive = (state: EditorState): boolean => {
    const type = this.type(state);
    return findParentNodeOfType(type)(state.selection) !== undefined;
  };
}
