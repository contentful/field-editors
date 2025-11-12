import noop from 'lodash/noop';
export function watchCurrentSlide(navigator) {
    const onActiveCallbacks = new Set();
    let wasSlideClosed = false;
    let initialSlideLevel;
    let lastSlideLevel;
    const status = ()=>({
            wasClosed: wasSlideClosed,
            isActive: !wasSlideClosed && lastSlideLevel === initialSlideLevel
        });
    const off = navigator.onSlideInNavigation(({ oldSlideLevel, newSlideLevel })=>{
        if (initialSlideLevel === undefined) {
            initialSlideLevel = oldSlideLevel;
        }
        lastSlideLevel = newSlideLevel;
        if (newSlideLevel < initialSlideLevel) {
            wasSlideClosed = true;
            off();
            onActiveCallbacks.clear();
        }
        if (status().isActive && newSlideLevel !== oldSlideLevel) {
            onActiveCallbacks.forEach((cb)=>cb());
        }
    });
    function unwatch() {
        off();
        onActiveCallbacks.clear();
    }
    function onActive(cb) {
        if (wasSlideClosed) return noop;
        if (status().isActive) {
            cb();
        }
        onActiveCallbacks.add(cb);
        return ()=>onActiveCallbacks.delete(cb);
    }
    return {
        status,
        onActive,
        unwatch
    };
}
