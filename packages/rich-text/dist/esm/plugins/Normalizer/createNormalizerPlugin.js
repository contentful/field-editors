import { withNormalizer } from './withNormalizer';
export const createNormalizerPlugin = ()=>({
        key: 'NormalizerPlugin',
        withOverrides: withNormalizer
    });
