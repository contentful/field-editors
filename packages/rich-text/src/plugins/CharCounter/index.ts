import { PlatePlugin } from '../../internal/types';
import { withCharCounter } from './withCharCounter';

export const createCharCounterPlugin = (): PlatePlugin => ({
  key: 'char-counter',
  withOverrides: withCharCounter,
});
