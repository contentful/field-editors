import { NavigatorAPI } from '@contentful/app-sdk';
/**
 * Allows to observe when the current slide-in navigation slide gets e.g.
 * re-activated after opening another slide on top. This is useful as the sdk
 * does not give full insights into e.g. whether sdk.dialogs.selectSingleEntry()
 * with `withCreate: true` option opens the slide-in navigation to edit the
 * created entry after returning it.
 */
export declare function watchCurrentSlide(navigator: NavigatorAPI): {
    status: () => {
        wasClosed: boolean;
        isActive: boolean;
    };
    onActive: (cb: Function) => (...args: any[]) => void;
    unwatch: () => void;
};
