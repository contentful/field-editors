import {
  BoldPlugin,
  CodePlugin,
  ItalicPlugin,
  StrikethroughPlugin,
  SubscriptPlugin,
  SuperscriptPlugin,
  UnderlinePlugin,
} from '@platejs/basic-nodes/react';
import { DocxPlugin } from '@platejs/docx';
import { ListPlugin } from '@platejs/list-classic/react';
import { TablePlugin } from '@platejs/table/react';
import { KEYS } from 'platejs';
import { ParagraphPlugin, toPlatePlugin } from 'platejs/react';

import { fromPlatePlugin } from './pluginAdapter';
import type { PlatePlugin } from './types/plugins';

export const createParagraphPlugin = (config: Partial<PlatePlugin>) =>
  fromPlatePlugin(ParagraphPlugin, config);
export const createBoldPlugin = (config: Partial<PlatePlugin>) =>
  fromPlatePlugin(BoldPlugin, config);
export const createCodePlugin = (config: Partial<PlatePlugin>) =>
  fromPlatePlugin(CodePlugin, config);
export const createItalicPlugin = (config: Partial<PlatePlugin>) =>
  fromPlatePlugin(ItalicPlugin, config);
export const createStrikethroughPlugin = (config: Partial<PlatePlugin>) =>
  fromPlatePlugin(StrikethroughPlugin, config);
export const createSubscriptPlugin = (config: Partial<PlatePlugin>) =>
  fromPlatePlugin(SubscriptPlugin, config);
export const createSuperscriptPlugin = (config: Partial<PlatePlugin>) =>
  fromPlatePlugin(SuperscriptPlugin, config);
export const createUnderlinePlugin = (config: Partial<PlatePlugin>) =>
  fromPlatePlugin(UnderlinePlugin, config);
export const createListPlugin = (config: Partial<PlatePlugin>) =>
  fromPlatePlugin(
    ListPlugin.extend({
      plugins: ListPlugin.plugins.filter((plugin) => plugin.key !== KEYS.taskList),
    }),
    { ...config, preserveEditorMethods: true },
  );
export const createTablePlugin = (config: Partial<PlatePlugin>) =>
  fromPlatePlugin(TablePlugin.extend({ transformInitialValue: ({ value }) => value }), {
    ...config,
    preserveEditorMethods: true,
    options: { ...config.options, disableMerge: true },
  });
export const createDeserializeDocxPlugin = (config: Partial<PlatePlugin>) =>
  fromPlatePlugin(toPlatePlugin(DocxPlugin), config);
