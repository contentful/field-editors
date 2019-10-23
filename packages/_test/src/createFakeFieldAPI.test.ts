import { createFakeFieldAPI } from './createFakeFieldAPI';

describe('createFakeFieldAPI', () => {
  it('exposes all methods', () => {
    const [field] = createFakeFieldAPI();
    expect(Object.keys(field).sort()).toMatchInlineSnapshot(`
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
