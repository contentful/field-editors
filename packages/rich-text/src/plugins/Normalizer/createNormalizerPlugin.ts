import { RichTextPlugin } from '../../types';
import { withNormalizer } from './withNormalizer';

export const createNormalizerPlugin = (): RichTextPlugin => ({
  key: 'NormalizerPlugin',
  // @ts-expect-error
  withOverrides: withNormalizer,
});
