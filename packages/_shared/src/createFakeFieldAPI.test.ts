import { createFakeFieldAPI } from './createFakeFieldAPI';

describe('createFakeFieldAPI', () => {
  it('exposes all methods', () => {
    expect(Object.keys(createFakeFieldAPI()).sort()).toMatchInlineSnapshot(`
      Array [
        "getValue",
        "id",
        "locale",
        "onIsDisabledChanged",
        "onSchemaErrorsChanged",
        "onValueChanged",
        "removeValue",
        "required",
        "setInvalid",
        "setValue",
        "type",
        "validations",
      ]
    `);
  });
});
