import { withCharCounter } from './withCharCounter';
export const createCharCounterPlugin = ()=>({
        key: 'char-counter',
        withOverrides: withCharCounter
    });
