export type ValidationType =
  | {
      type: 'max';
      max: number;
      isDefaultConstraint?: boolean;
    }
  | {
      type: 'min';
      min: number;
    }
  | {
      type: 'min-max';
      min: number;
      max: number;
    };
