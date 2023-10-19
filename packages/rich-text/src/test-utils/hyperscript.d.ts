// eslint-disable-next-line -- TODO: explain this disable
declare namespace JSX {
  // eslint-disable-next-line -- TODO: explain this disable
  interface Element {}
  interface IntrinsicElements {
    editor: {};
    focus: {};
    anchor: {};
    cursor: {};

    htext: {
      bold?: boolean;
      underline?: boolean;
      italic?: boolean;
      children?: string;
    };

    hp: {};
    hquote: {};
    hcode: {};

    hh1: {};
    hh2: {};
    hh3: {};
    hh4: {};
    hh5: {};
    hh6: {};

    hinline: {
      type: 'Entry';
      id: string;
      children?: unknown;
    };

    hembed: {
      type: 'Entry' | 'Asset';
      id: string;
      children?: unknown;
    };

    hlink:
      | {
          uri: string;
          children?: string;
        }
      | {
          asset: string;
          children?: string;
        }
      | {
          entry: string;
          children?: string;
        }
      | {
          resource: string;
          children?: string;
        };

    hul: {};
    hol: {};
    hli: {};

    htable: {};
    htr: {};
    htd: {};
    hth: {};
  }
}
