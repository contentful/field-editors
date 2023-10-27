import AppSDK from '@contentful/app-sdk';
const {
  //@ts-expect-error
  AccessAPI,
  //@ts-expect-error
  AppConfigAPI,
  //@ts-expect-error
  BaseAppSDK,
  //@ts-expect-error
  ContentType,
  //@ts-expect-error
  DialogsAPI,
  //@ts-expect-error
  EntryAPI,
  //@ts-expect-error
  EntryFieldAPI,
  //@ts-expect-error
  FieldAPI,
  //@ts-expect-error
  FieldAppSDK,
  //@ts-expect-error
  IdsAPI,
  //@ts-expect-error
  LocalesAPI,
  //@ts-expect-error
  LocationAPI,
  //@ts-expect-error
  NavigatorAPI,
  //@ts-expect-error
  NotifierAPI,
  //@ts-expect-error
  OpenCustomWidgetOptions,
  //@ts-expect-error
  ParametersAPI,
  //@ts-expect-error
  SpaceAPI,
  //@ts-expect-error
  WindowAPI,
} = AppSDK;

export {
  AccessAPI,
  AppConfigAPI,
  BaseAppSDK,
  ContentType,
  DialogsAPI,
  EntryAPI,
  EntryFieldAPI,
  FieldAPI,
  FieldAppSDK,
  IdsAPI,
  LocalesAPI,
  LocationAPI,
  NavigatorAPI,
  NotifierAPI,
  OpenCustomWidgetOptions,
  ParametersAPI,
  SpaceAPI,
  WindowAPI,
};

export { CharCounter } from './CharCounter.js';
export { CharValidation } from './CharValidation.js';
export { FieldConnector } from './FieldConnector.js';
export type { FieldConnectorChildProps } from './FieldConnector.js';
export { PredefinedValuesError } from './PredefinedValuesError.js';
export { Asset, Entry, File } from './typesEntity.js';
export { isValidImage } from './utils/isValidImage.js';
export { shortenStorageUnit, toLocaleString } from './utils/shortenStorageUnit.js';
export { ModalDialogLauncher };
export { entityHelpers };
export { ConstraintsUtils };

import * as ModalDialogLauncher from './ModalDialogLauncher.js';
import * as ConstraintsUtils from './utils/constraints.js';
import * as entityHelpers from './utils/entityHelpers.js';
