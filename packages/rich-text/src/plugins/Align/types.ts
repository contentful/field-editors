// custom types for text alignment

export enum ALIGNMENT {
  LEFT = 'left',
  CENTER = 'center',
  RIGHT = 'right',
  JUSTIFY = 'justify',
}

export type CustomText = {
  text: string;
  [ALIGNMENT.LEFT]?: boolean;
  [ALIGNMENT.CENTER]?: boolean;
  [ALIGNMENT.RIGHT]?: boolean;
};

export type TextOrCustomElement = CustomElement | CustomText;

export type CustomElement<T = unknown> = {
  type: string;
  alignmentType?: string;
  children: TextOrCustomElement[];
  data: T;
  isVoid?: boolean;
  text?: string;
};
