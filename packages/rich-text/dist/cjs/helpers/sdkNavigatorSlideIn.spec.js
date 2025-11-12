"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
const _mitt = /*#__PURE__*/ _interop_require_default(require("mitt"));
const _sdkNavigatorSlideIn = require("./sdkNavigatorSlideIn");
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
if (typeof globalThis.structuredClone !== 'function') {
    globalThis.structuredClone = (obj)=>{
        return JSON.parse(JSON.stringify(obj));
    };
}
function createFakeNavigatorAPI() {
    const localEmitter = (0, _mitt.default)();
    const navigatorEmitter = {
        slideIn: (slide)=>localEmitter.emit('onSlideInNavigation', slide)
    };
    const api = {
        openNewAsset: async ()=>({
                navigated: false
            }),
        openAsset: async ()=>({
                navigated: false
            }),
        openNewEntry: async ()=>({
                navigated: false
            }),
        openEntry: async ()=>({
                navigated: false
            }),
        onSlideInNavigation: (handler)=>{
            const type = `onSlideInNavigation`;
            localEmitter.on(type, handler);
            return ()=>{
                localEmitter.off(type, handler);
            };
        }
    };
    return [
        api,
        navigatorEmitter
    ];
}
describe('watchCurrentSlide().info()', ()=>{
    let fake, slide;
    beforeEach(()=>{
        const fakeNavigator = createFakeNavigatorAPI();
        const api = fakeNavigator[0];
        fake = fakeNavigator[1];
        slide = (0, _sdkNavigatorSlideIn.watchCurrentSlide)(api);
    });
    it('considers current slide active initially', ()=>{
        expect(slide.status()).toEqual({
            wasClosed: false,
            isActive: true
        });
    });
    it('no longer considers slide active after another slide opens', ()=>{
        fake.slideIn({
            oldSlideLevel: 0,
            newSlideLevel: 1
        });
        expect(slide.status()).toEqual({
            wasClosed: false,
            isActive: false
        });
    });
    it('considers the original slide active after opening and closing another slide', ()=>{
        fake.slideIn({
            oldSlideLevel: 0,
            newSlideLevel: 1
        });
        fake.slideIn({
            oldSlideLevel: 1,
            newSlideLevel: 0
        });
        expect(slide.status()).toEqual({
            wasClosed: false,
            isActive: true
        });
    });
    it('considers slide closed after jumping to slide below', ()=>{
        fake.slideIn({
            oldSlideLevel: 1,
            newSlideLevel: 0
        });
        expect(slide.status()).toEqual({
            wasClosed: true,
            isActive: false
        });
    });
    it('still considers slide closed after jumping to slide below and opening a new one', ()=>{
        fake.slideIn({
            oldSlideLevel: 1,
            newSlideLevel: 0
        });
        fake.slideIn({
            oldSlideLevel: 0,
            newSlideLevel: 1
        });
        expect(slide.status()).toEqual({
            wasClosed: true,
            isActive: false
        });
    });
    it('considers slide closed after opening new slide and then jumping to slide below', ()=>{
        fake.slideIn({
            oldSlideLevel: 1,
            newSlideLevel: 2
        });
        fake.slideIn({
            oldSlideLevel: 2,
            newSlideLevel: 0
        });
        expect(slide.status()).toEqual({
            wasClosed: true,
            isActive: false
        });
    });
});
describe('watchCurrentSlide().onActive()', ()=>{
    let api, fake, spy;
    beforeEach(()=>{
        const fakeNavigator = createFakeNavigatorAPI();
        api = fakeNavigator[0];
        fake = fakeNavigator[1];
        spy = jest.fn();
    });
    it('fires initially if there was no slide event', ()=>{
        const slide = (0, _sdkNavigatorSlideIn.watchCurrentSlide)(api);
        slide.onActive(spy);
        expect(spy).toHaveBeenCalledTimes(1);
    });
    it('does not fire initially, if new slide already opened, but fires after slide gets closed again', ()=>{
        const slide = (0, _sdkNavigatorSlideIn.watchCurrentSlide)(api);
        fake.slideIn({
            oldSlideLevel: 2,
            newSlideLevel: 3
        });
        slide.onActive(spy);
        expect(spy).toHaveBeenCalledTimes(0);
        fake.slideIn({
            oldSlideLevel: 3,
            newSlideLevel: 2
        });
        expect(spy).toHaveBeenCalledTimes(1);
    });
    it('fires every time slide becomes active again', ()=>{
        const slide = (0, _sdkNavigatorSlideIn.watchCurrentSlide)(api);
        slide.onActive(spy);
        expect(spy).toHaveBeenCalledTimes(1);
        fake.slideIn({
            oldSlideLevel: 0,
            newSlideLevel: 1
        });
        fake.slideIn({
            oldSlideLevel: 1,
            newSlideLevel: 0
        });
        expect(spy).toHaveBeenCalledTimes(2);
    });
    it('does not fire on a slide-in event for the same slide we are already on', ()=>{
        const slide = (0, _sdkNavigatorSlideIn.watchCurrentSlide)(api);
        slide.onActive(spy);
        expect(spy).toHaveBeenCalledTimes(1);
        fake.slideIn({
            oldSlideLevel: 0,
            newSlideLevel: 0
        });
        expect(spy).toHaveBeenCalledTimes(1);
    });
});
describe('watchCurrentSlide().unwatch()', ()=>{
    let api, fake;
    beforeEach(()=>{
        const fakeNavigator = createFakeNavigatorAPI();
        api = fakeNavigator[0];
        fake = fakeNavigator[1];
    });
    it('does not update .info() after .unwatch()', ()=>{
        const slide = (0, _sdkNavigatorSlideIn.watchCurrentSlide)(api);
        const lastStatus = structuredClone(slide.status());
        slide.unwatch();
        fake.slideIn({
            oldSlideLevel: 1,
            newSlideLevel: 0
        });
        expect(lastStatus).toEqual(slide.status());
    });
    it('does not fire outstanding onActive after unwatch()', ()=>{
        const slide = (0, _sdkNavigatorSlideIn.watchCurrentSlide)(api);
        const slide2 = (0, _sdkNavigatorSlideIn.watchCurrentSlide)(api);
        const spy = jest.fn();
        const spy2 = jest.fn();
        fake.slideIn({
            oldSlideLevel: 0,
            newSlideLevel: 1
        });
        slide.onActive(spy);
        slide2.onActive(spy2);
        slide.unwatch();
        fake.slideIn({
            oldSlideLevel: 1,
            newSlideLevel: 0
        });
        expect(spy).toHaveBeenCalledTimes(0);
        expect(spy2).toHaveBeenCalledTimes(1);
    });
});
