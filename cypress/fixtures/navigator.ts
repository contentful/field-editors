import { NavigatorAPI, NavigatorSlideInfo } from '@contentful/app-sdk';
import mitt from 'mitt';

export type NavigatorAPIEmitter = {
  slideIn: (slide: NavigatorSlideInfo) => void;
};

export function createFakeNavigatorAPI(): [NavigatorAPI, NavigatorAPIEmitter] {
  const localEmitter = mitt();
  const navigatorEmitter: NavigatorAPIEmitter = {
    slideIn: (slide) => localEmitter.emit('onSlideInNavigation', slide),
  };

  const api = {
    openNewAsset: async () => ({
      navigated: false,
    }),
    openAsset: async () => ({
      navigated: false,
    }),
    openNewEntry: async () => ({
      navigated: false,
    }),
    openEntry: async () => ({
      navigated: false,
    }),
    onSlideInNavigation: (handler) => {
      const type = `onSlideInNavigation`;
      localEmitter.on(type, handler);

      return () => {
        localEmitter.off(type, handler);
      };
    },
  } as unknown as NavigatorAPI;

  return [api, navigatorEmitter];
}
