/* eslint-env node */
module.exports = {
  rules: {
    'enforce-translation-call-format': require('./rules/enforce-translation-call-format'),
    'enforce-translation-key-naming': require('./rules/enforce-translation-key-naming'),
  },
};
