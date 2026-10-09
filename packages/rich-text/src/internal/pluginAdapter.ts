import { syncLegacyMethods, type Value } from 'platejs';
import {
  createPlateEditor as createNativeEditor,
  createPlatePlugin,
  type AnyPlatePlugin,
  type CreatePlateEditorOptions as NativeEditorOptions,
} from 'platejs/react';

import type { PlateEditor } from './types/editor';
import type { PlatePlugin } from './types/plugins';

export type CreatePlateEditorOptions = Omit<
  NativeEditorOptions,
  'plugins' | 'editor' | 'normalizeInitialValue'
> & {
  editor?: any;
  plugins?: PlatePlugin[];
  normalizeInitialValue?: boolean;
};

export const fromPlatePlugin = (
  basePlugin: AnyPlatePlugin,
  config: Partial<PlatePlugin> = {},
): PlatePlugin => ({
  key: basePlugin.key,
  type: basePlugin.node.type,
  isElement: basePlugin.node.isElement,
  isLeaf: basePlugin.node.isLeaf,
  isInline: basePlugin.node.isInline,
  isVoid: basePlugin.node.isVoid,
  plugins: basePlugin.plugins.map((plugin) => fromPlatePlugin(plugin)),
  ...config,
  options: { ...basePlugin.options, ...config.options },
  basePlugin,
});

export const mockPlugin = <P extends PlatePlugin = PlatePlugin>(
  plugin?: Partial<P>,
): P & { options: any } =>
  ({
    key: 'mock',
    options: {},
    ...plugin,
  }) as P & { options: any };

export const getContentfulPlugins = (editor: PlateEditor): PlatePlugin[] =>
  editor.contentfulPlugins;

export const createPlateEditor = (options: CreatePlateEditorOptions = {}): PlateEditor => {
  const descriptors: PlatePlugin[] = [];
  const overrides = Object.assign(
    {},
    ...(options.plugins ?? []).map((plugin) => plugin.overrideByKey),
  );
  const collect = (plugin: PlatePlugin): PlatePlugin => {
    const resolved = { ...plugin, ...overrides[plugin.key] };
    descriptors.push(resolved);
    resolved.plugins = resolved.plugins?.map(collect);
    return resolved;
  };
  const plugins = (options.plugins ?? []).map(collect);
  const convert = (plugin: PlatePlugin): AnyPlatePlugin => {
    const config: any = {
      key: plugin.key,
      node: {
        type: plugin.type ?? plugin.key,
        isElement: plugin.isElement,
        isLeaf: plugin.isLeaf,
        isInline: plugin.isInline,
        isVoid: plugin.isVoid,
        isMarkableVoid: plugin.isMarkableVoid,
        component: plugin.component,
      },
      options: plugin.options,
      plugins: plugin.plugins?.map(convert),
      handlers: Object.fromEntries(
        Object.entries(plugin.handlers ?? {}).map(([name, handler]) => [
          name,
          ({ editor, event }: any) =>
            handler(editor, plugin as PlatePlugin & { options: any })(event),
        ]),
      ),
    };
    let preservedMethods: { api: PlateEditor['api']; transforms: PlateEditor['tf'] } | undefined;
    if (plugin.withOverrides || plugin.then || plugin.preserveEditorMethods) {
      config.extendEditor = ({ editor }: { editor: PlateEditor }) => {
        if (plugin.then) {
          Object.assign(plugin, plugin.then(editor, plugin));
          if (plugin.options) editor.setOptions({ key: plugin.key }, plugin.options);
        }
        plugin.withOverrides?.(editor, plugin as PlatePlugin & { options: any });
        if (plugin.preserveEditorMethods) {
          // Contentful composes only the upstream list/table overrides compatible
          // with its document schema. Keep those methods after native extensions
          // register their additional APIs and transforms.
          syncLegacyMethods(editor);
          preservedMethods = { api: { ...editor.api }, transforms: { ...editor.tf } };
        }
        return editor;
      };
    }
    if (plugin.deserializeHtml) {
      const { getNode, query, ...deserializer } = plugin.deserializeHtml;
      config.parsers = {
        html: {
          deserializer: {
            ...deserializer,
            ...(query && { query: ({ element }: any) => query(element) }),
            ...(getNode && { parse: ({ element, node }: any) => getNode(element, node) }),
          },
        },
      };
    }
    if (plugin.decorate)
      config.decorate = ({ editor, entry }: any) => plugin.decorate!(editor)(entry);
    if (plugin.inject?.pluginsByKey) {
      config.inject = {
        plugins: Object.fromEntries(
          Object.entries(plugin.inject.pluginsByKey).map(([key, injected]) => [
            key,
            {
              parser: {
                format: injected.editor?.insertData?.format,
                transformData: injected.editor?.insertData?.transformData
                  ? ({ data, dataTransfer }: any) =>
                      injected.editor!.insertData!.transformData!(data, { dataTransfer })
                  : undefined,
              },
            },
          ]),
        ),
      };
    }
    const nativePlugin = plugin.basePlugin
      ? plugin.basePlugin.configure(config).extend(({ plugin: resolvedPlugin }) => ({
          // Native plugins can register shortcuts lazily. Disable them after
          // resolution so Contentful's keyboard handlers remain authoritative.
          shortcuts: Object.fromEntries(
            Object.keys(resolvedPlugin.shortcuts ?? {}).map((key) => [key, null]),
          ),
        }))
      : createPlatePlugin(config);
    return plugin.preserveEditorMethods
      ? nativePlugin.overrideEditor(() => preservedMethods ?? {})
      : nativePlugin;
  };
  const setup = createPlatePlugin({
    key: 'contentfulSetup',
    priority: 10000,
    extendEditor: ({ editor }) => {
      (editor as PlateEditor).contentfulPlugins = descriptors;
      // Plate resolves a throwaway plugin (lodash deep-merge) for every lookup
      // of an unregistered key, e.g. the list normalizer's `taskList` on every
      // element. Its type is always the key itself, so skip the resolution.
      const { getType } = editor;
      editor.getType = (key) => (editor.plugins[key] ? getType(key) : key);
      return editor;
    },
  });
  const { editor: input, normalizeInitialValue, ...nativeOptions } = options;
  return createNativeEditor<Value>({
    ...nativeOptions,
    ...(input && { value: input.children, selection: input.selection }),
    plugins: [setup, ...plugins.map(convert)],
    nodeId: false,
    chunking: false,
    affinity: false,
    shouldNormalizeEditor: normalizeInitialValue === true,
  }) as PlateEditor;
};
