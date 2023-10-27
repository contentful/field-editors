import { createFakeFieldAPI } from './createFakeFieldAPI.js';

describe('createFakeFieldAPI', () => {
  it('exposes all methods', () => {
    const [field] = createFakeFieldAPI();
    expect(Object.keys(field).sort()).toMatchInlineSnapshot(`
      [
        "getIsDisabled",
        "getSchemaErrors",
        "getValue",
        "id",
        "locale",
        "name",
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
