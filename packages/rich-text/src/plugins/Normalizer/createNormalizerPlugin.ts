import { PlatePlugin } from '../../internal/types';
import { withNormalizer } from './withNormalizer';

export const createNormalizerPlugin = (): PlatePlugin => ({
  key: 'NormalizerPlugin',
  withOverrides: withNormalizer,
});
