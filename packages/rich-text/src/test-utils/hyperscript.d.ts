// eslint-disable-next-line
declare namespace JSX {
  // eslint-disable-next-line
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
    hblockquote: {};
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
    };

    hembed: {
      type: 'Entry' | 'Asset';
      id: string;
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
