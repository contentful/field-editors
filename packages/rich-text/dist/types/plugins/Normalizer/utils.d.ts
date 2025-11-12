import { NodeValidator, NodeTransformer } from './types';
export declare class NormalizerError extends Error {
}
export declare const createValidatorFromTypes: (types: string[]) => NodeValidator;
export declare const createTransformerFromObject: (transforms: Record<string, NodeTransformer>) => NodeTransformer;
