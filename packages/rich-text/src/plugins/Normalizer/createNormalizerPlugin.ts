import { RichTextPlugin } from '../../types';
import { withNormalizer } from './withNormalizer';

export const createNormalizerPlugin = (): RichTextPlugin => ({
  key: 'NormalizerPlugin',
  withOverrides: withNormalizer,
});
