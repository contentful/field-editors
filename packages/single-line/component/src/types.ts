export type ValidationType =
  | {
      type: 'max';
      max: number;
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
