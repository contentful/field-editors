"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "useCommandList", {
    enumerable: true,
    get: function() {
        return useCommandList;
    }
});
const _react = /*#__PURE__*/ _interop_require_wildcard(require("react"));
const _ishotkey = /*#__PURE__*/ _interop_require_default(require("is-hotkey"));
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
function _getRequireWildcardCache(nodeInterop) {
    if (typeof WeakMap !== "function") return null;
    var cacheBabelInterop = new WeakMap();
    var cacheNodeInterop = new WeakMap();
    return (_getRequireWildcardCache = function(nodeInterop) {
        return nodeInterop ? cacheNodeInterop : cacheBabelInterop;
    })(nodeInterop);
}
function _interop_require_wildcard(obj, nodeInterop) {
    if (!nodeInterop && obj && obj.__esModule) {
        return obj;
    }
    if (obj === null || typeof obj !== "object" && typeof obj !== "function") {
        return {
            default: obj
        };
    }
    var cache = _getRequireWildcardCache(nodeInterop);
    if (cache && cache.has(obj)) {
        return cache.get(obj);
    }
    var newObj = {
        __proto__: null
    };
    var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor;
    for(var key in obj){
        if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) {
            var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null;
            if (desc && (desc.get || desc.set)) {
                Object.defineProperty(newObj, key, desc);
            } else {
                newObj[key] = obj[key];
            }
        }
    }
    newObj.default = obj;
    if (cache) {
        cache.set(obj, newObj);
    }
    return newObj;
}
const useCommandList = (commandItems, container)=>{
    const [selectedItem, setSelectedItem] = _react.useState(()=>{
        if (!commandItems.length) {
            return '';
        }
        if ('group' in commandItems[0]) {
            return commandItems[0].commands[0].id;
        }
        return commandItems[0].id;
    });
    const [isOpen, setIsOpen] = _react.useState(commandItems.length > 0);
    _react.useEffect(()=>{
        if (!container.current) {
            return;
        }
        const buttons = Array.from(container.current.querySelectorAll('button'));
        const currBtn = buttons.find((btn)=>btn.id === selectedItem);
        const currIndex = currBtn ? buttons.indexOf(currBtn) : 0;
        const shouldSelectFirstBtn = !currBtn && buttons.length;
        if (shouldSelectFirstBtn) {
            setSelectedItem(buttons[0].id);
            buttons[0].scrollIntoView({
                block: 'nearest',
                inline: 'start'
            });
        }
        function handleKeyDown(event) {
            if ((0, _ishotkey.default)('up', event)) {
                event.preventDefault();
                if (currIndex === 0) {
                    return;
                }
                setSelectedItem(buttons[currIndex - 1].id);
                buttons[currIndex - 1].scrollIntoView({
                    block: 'nearest',
                    inline: 'start'
                });
            } else if ((0, _ishotkey.default)('down', event)) {
                event.preventDefault();
                if (currIndex === buttons.length - 1) {
                    return;
                }
                setSelectedItem(buttons[currIndex + 1].id);
                buttons[currIndex + 1].scrollIntoView({
                    block: 'nearest',
                    inline: 'start'
                });
            } else if ((0, _ishotkey.default)('enter', event)) {
                event.preventDefault();
                if (currBtn) {
                    setSelectedItem('');
                    currBtn.click();
                }
            }
        }
        if (commandItems.length) {
            window.addEventListener('keydown', handleKeyDown);
        }
        return ()=>window.removeEventListener('keydown', handleKeyDown);
    }, [
        commandItems,
        container,
        selectedItem
    ]);
    _react.useEffect(()=>{
        const handleMousedown = (event)=>{
            if (container.current && !container.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleMousedown);
        return ()=>{
            document.removeEventListener('mousedown', handleMousedown);
        };
    }, [
        container
    ]);
    return {
        selectedItem,
        isOpen
    };
};
