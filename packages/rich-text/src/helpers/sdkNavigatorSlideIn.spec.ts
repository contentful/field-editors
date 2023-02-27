import cloneDeep from 'lodash/cloneDeep';

import { createFakeNavigatorAPI } from '../../../../cypress/fixtures/navigator';
import { watchCurrentSlide } from './sdkNavigatorSlideIn';

describe('watchCurrentSlide().info()', () => {
  let fake, slide;

  beforeEach(() => {
    const fakeNavigator = createFakeNavigatorAPI();
    const api = fakeNavigator[0];
    fake = fakeNavigator[1];
    slide = watchCurrentSlide(api);
  });

  it('considers current slide active initially', () => {
    expect(slide.status()).toEqual({
      wasClosed: false,
      isActive: true,
    });
  });

  it('no longer considers slide active after another slide opens', () => {
    fake.slideIn({
      oldSlideLevel: 0,
      newSlideLevel: 1,
    });
    expect(slide.status()).toEqual({
      wasClosed: false,
      isActive: false,
    });
  });

  it('considers the original slide active after opening and closing another slide', () => {
    fake.slideIn({
      oldSlideLevel: 0,
      newSlideLevel: 1,
    });
    fake.slideIn({
      oldSlideLevel: 1,
      newSlideLevel: 0,
    });
    expect(slide.status()).toEqual({
      wasClosed: false,
      isActive: true,
    });
  });

  it('considers slide closed after jumping to slide below', () => {
    fake.slideIn({
      oldSlideLevel: 1,
      newSlideLevel: 0,
    });
    expect(slide.status()).toEqual({
      wasClosed: true,
      isActive: false,
    });
  });

  it('still considers slide closed after jumping to slide below and opening a new one', () => {
    fake.slideIn({
      oldSlideLevel: 1,
      newSlideLevel: 0,
    });
    fake.slideIn({
      oldSlideLevel: 0,
      newSlideLevel: 1,
    });
    expect(slide.status()).toEqual({
      wasClosed: true,
      isActive: false,
    });
  });

  it('considers slide closed after opening new slide and then jumping to slide below', () => {
    fake.slideIn({
      oldSlideLevel: 1,
      newSlideLevel: 2,
    });
    fake.slideIn({
      oldSlideLevel: 2,
      newSlideLevel: 0,
    });
    expect(slide.status()).toEqual({
      wasClosed: true,
      isActive: false,
    });
  });
});

describe('watchCurrentSlide().onActive()', () => {
  let api, fake, spy;

  beforeEach(() => {
    const fakeNavigator = createFakeNavigatorAPI();
    api = fakeNavigator[0];
    fake = fakeNavigator[1];
    spy = jest.fn();
  });

  it('fires initially if there was no slide event', () => {
    const slide = watchCurrentSlide(api);
    slide.onActive(spy);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('does not fire initially, if new slide already opened, but fires after slide gets closed again', () => {
    const slide = watchCurrentSlide(api);

    fake.slideIn({
      oldSlideLevel: 2,
      newSlideLevel: 3,
    });
    slide.onActive(spy);
    expect(spy).toHaveBeenCalledTimes(0);

    fake.slideIn({
      oldSlideLevel: 3,
      newSlideLevel: 2,
    });
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('fires every time slide becomes active again', () => {
    const slide = watchCurrentSlide(api);
    slide.onActive(spy);
    expect(spy).toHaveBeenCalledTimes(1);

    fake.slideIn({
      oldSlideLevel: 0,
      newSlideLevel: 1,
    });
    fake.slideIn({
      oldSlideLevel: 1,
      newSlideLevel: 0,
    });
    expect(spy).toHaveBeenCalledTimes(2);
  });
});

describe('watchCurrentSlide().unwatch()', () => {
  let api, fake;

  beforeEach(() => {
    const fakeNavigator = createFakeNavigatorAPI();
    api = fakeNavigator[0];
    fake = fakeNavigator[1];
  });

  it('does not update .info() after .unwatch()', () => {
    const slide = watchCurrentSlide(api);
    const lastStatus = cloneDeep(slide.status());

    slide.unwatch();

    fake.slideIn({
      oldSlideLevel: 1,
      newSlideLevel: 0,
    });
    expect(lastStatus).toEqual(slide.status());
  });

  it('does not fire outstanding onActive after unwatch()', () => {
    const slide = watchCurrentSlide(api);
    const slide2 = watchCurrentSlide(api);
    const spy = jest.fn();
    const spy2 = jest.fn();

    fake.slideIn({
      oldSlideLevel: 0,
      newSlideLevel: 1,
    });

    slide.onActive(spy);
    slide2.onActive(spy2);

    slide.unwatch();

    fake.slideIn({
      oldSlideLevel: 1,
      newSlideLevel: 0,
    });
    expect(spy).toHaveBeenCalledTimes(0);
    // Demonstrate that normally this would fire an event if it wasn't for the unwatch()
    expect(spy2).toHaveBeenCalledTimes(1);
  });
});
