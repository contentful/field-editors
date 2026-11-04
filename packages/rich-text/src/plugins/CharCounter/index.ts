import { PlatePlugin } from '../../internal/types';
import { withCharCounter } from './withCharCounter';

export const createCharCounterPlugin = (): PlatePlugin => ({
  key: 'char-counter',
  options: { count: undefined },
  withOverrides: withCharCounter,
});
