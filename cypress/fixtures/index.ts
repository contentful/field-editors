import { NavigatorAPIEmitter } from './navigator';
import { PubsubEmitter } from './pubsub';
import { Store } from './store';

export * from './FakeSdk';
export * as fixtures from '../../packages/reference/src/__fixtures__/fixtures';
export * from './pubsub';
export * from './store';
export * as utils from './utils';

export type ComponentFixtures = {
  store: Store;
  pubsub: PubsubEmitter;
  navigator: NavigatorAPIEmitter;
};
