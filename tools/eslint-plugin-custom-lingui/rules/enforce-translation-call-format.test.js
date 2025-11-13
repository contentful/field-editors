/* eslint-env node */
/* eslint-disable @typescript-eslint/no-var-requires */
const { RuleTester } = require('eslint');

const rule = require('./enforce-translation-call-format');

const ruleTester = new RuleTester({
  languageOptions: {
    parserOptions: {
      ecmaFeatures: { jsx: true },
    },
  },
});

ruleTester.run('translation-call-format', rule, {
  valid: [
    // Valid t usages
    {
      code: `import { t } from '@lingui/core/macro'; t({ id: '', message: '' });`,
    },
    {
      code: `import { t } from '@lingui/core/macro'; t({ id: '', message: \`\` });`,
    },
    {
      code: `import { plural, t } from '@lingui/core/macro'; t({ id: '', message: plural(count, { other: '' }) });`,
    },
    // Valid Trans usages
    {
      code: `import { Trans } from '@lingui/react'; <Trans id="" message="" />;`,
    },
    // Valid Trans from macro uses children
    {
      code: `import { Trans } from '@lingui/react/macro'; <Trans id="">This is a message</Trans>;`,
    },
    // Valid Plural usages
    {
      code: `import { Plural } from '@lingui/react/macro'; <Plural id="" other="" />;`,
    },
    {
      code: `import { Plural } from '@lingui/react/macro'; <Plural id="" other={\`\`} />;`,
    },
    // Valid Plural usage
    {
      code: `import { Plural, Trans } from '@lingui/react/macro'; <Plural id="UI.Dashboard.Widget.Header" other={<Trans>test</Trans>} />;`,
    },
  ],

  invalid: [
    // t macro’s parameters object passed as variable
    {
      code: `import { t } from '@lingui/core/macro'; const params = { id: '' }; t(params);`,
      errors: [{ messageId: 'parametersMustBeObject' }],
    },
    {
      code: `import { t as t2 } from '@lingui/core/macro'; const params = { id: '' }; t2(params);`,
      errors: [{ messageId: 'parametersMustBeObject' }],
    },
    // t macro’s message parameter missing
    {
      code: `import { t } from '@lingui/core/macro'; t({ id: '' });`,
      errors: [{ messageId: 'tMacroMessageMissing' }],
    },
    // t macro’s message parameter passed as variable
    {
      code: `import { t } from '@lingui/core/macro'; const message = ''; t({ id: '', message });`,
      errors: [{ messageId: 'tMacroMessageMustBeStringOrPlural' }],
    },
    // t macro’s message parameter passed as expression
    {
      code: `import { t } from '@lingui/core/macro'; t({ id: '', message: '' + '' });`,
      errors: [{ messageId: 'tMacroMessageMustBeStringOrPlural' }],
    },
    // t macro called as tag function
    {
      code: `import { t } from '@lingui/core/macro'; t\`\``,
      errors: [{ messageId: 'tMacroAsTagFunction' }],
    },

    // plural macro called outside t macro
    {
      code: `import { plural } from '@lingui/core/macro'; const count = 1; plural(count, { other: 'message' })`,
      errors: [{ messageId: 'pluralMacroOutsideTMacro' }],
    },
    {
      code: `import { plural as plural2 } from '@lingui/core/macro'; const count = 1; plural2(count, { other: 'message' })`,
      errors: [{ messageId: 'pluralMacroOutsideTMacro' }],
    },
    // plural macro’s other parameter passed as variable
    {
      code: `import { plural, t } from '@lingui/core/macro'; const message = ''; t({ id: '', message: plural(count, { other: message }) });`,
      errors: [{ messageId: 'pluralMacroArgumentMustBeString' }],
    },
    // plural macro’s one parameter passed as variable
    {
      code: `import { plural, t } from '@lingui/core/macro'; const message = ''; t({ id: '', message: plural(count, { one: message }) });`,
      errors: [{ messageId: 'pluralMacroArgumentMustBeString' }],
    },
    // plural macro’s 0 parameter passed as variable
    {
      code: `import { plural, t } from '@lingui/core/macro'; const message = ''; t({ id: '', message: plural(count, { [0]: message }) });`,
      errors: [{ messageId: 'pluralMacroZeroNotAllowed' }],
    },
    // plural macro’s 0 parameter as literal key should also be disallowed
    {
      code: `import { plural, t } from '@lingui/core/macro'; t({ id: '', message: plural(count, { 0: '' }) });`,
      errors: [{ messageId: 'pluralMacroZeroNotAllowed' }],
    },

    // Trans component’s message prop missing
    {
      code: `import { Trans } from '@lingui/react'; <Trans id="" />;`,
      errors: [{ messageId: 'transComponentMessageMissing' }],
    },
    {
      code: `import { Trans as Trans2 } from '@lingui/react'; <Trans2 id="" />;`,
      errors: [{ messageId: 'transComponentMessageMissing' }],
    },
    // Trans component’s message prop passed as variable
    {
      code: `import { Trans } from '@lingui/react'; const message = ''; <Trans id="" message={message} />;`,
      errors: [{ messageId: 'transComponentMessageMustBeString' }],
    },
    // Trans component’s message prop passed as template literal
    {
      code: `import { Trans } from '@lingui/react'; <Trans id="" message={\`\`} />;`,
      errors: [{ messageId: 'transComponentMessageMustBeString' }],
    },
    // Disallow using core/macro t inside Trans children (macro)
    {
      code: `import { Trans } from '@lingui/react/macro'; import { t } from '@lingui/core/macro'; <Trans id="">{t({ id: '', message: '' })}</Trans>;`,
      errors: [{ messageId: 'noCoreMacroInsideTrans' }],
    },
    // Disallow using core/macro plural inside Trans children (macro)
    {
      code: `import { Trans } from '@lingui/react/macro'; import { plural } from '@lingui/core/macro'; <Trans id="">{plural(count, { other: '' })}</Trans>;`,
      errors: [{ messageId: 'noCoreMacroInsideTrans' }],
    },

    // Plural component’s other prop passed as variable
    {
      code: `import { Plural } from '@lingui/react/macro'; const message = ''; <Plural id="" other={message} />;`,
      errors: [{ messageId: 'pluralComponentPropMustBeString' }],
    },
    // Plural component’s other prop passed as plural macro
    {
      code: `import { Plural } from '@lingui/react/macro'; const count = 1; <Plural id="" other={plural(count, {other: ''})} />;`,
      errors: [{ messageId: 'pluralComponentPropMustBeString' }],
    },
    // Plural component’s other prop passed as Trans component
    {
      code: `import { Plural } from '@lingui/react/macro'; import { Trans } from '@lingui/react'; <Plural id="UI.Dashboard.Widget.Header" other={<Trans message="test" />} />;`,
      errors: [{ messageId: 'pluralComponentPropMustBeString' }],
    },
    // Plural component’s one prop passed as variable
    {
      code: `import { Plural } from '@lingui/react/macro'; const message = ''; <Plural id="" one={message} />;`,
      errors: [{ messageId: 'pluralComponentPropMustBeString' }],
    },
    // Plural component’s one prop passed as plural macro
    {
      code: `import { Plural } from '@lingui/react/macro'; const count = 1; <Plural id="" one={plural(count, {other: ''})} />;`,
      errors: [{ messageId: 'pluralComponentPropMustBeString' }],
    },
    // Plural component’s one prop passed as Trans component
    {
      code: `import { Plural } from '@lingui/react/macro'; import { Trans } from '@lingui/react'; <Plural id="UI.Dashboard.Widget.Header" one={<Trans message="test" />} />;`,
      errors: [{ messageId: 'pluralComponentPropMustBeString' }],
    },
    // Plural component’s _0 prop passed as variable
    {
      code: `import { Plural } from '@lingui/react/macro'; const message = ''; <Plural id="" _0={message} />;`,
      errors: [{ messageId: 'pluralComponentPropMustBeString' }],
    },
    // Plural component’s _0 prop passed as plural macro
    {
      code: `import { Plural } from '@lingui/react/macro'; const count = 1; <Plural id="" _0={plural(count, {other: ''})} />;`,
      errors: [{ messageId: 'pluralComponentPropMustBeString' }],
    },
    // Plural component’s _0 prop passed as Trans component
    {
      code: `import { Plural } from '@lingui/react/macro'; import { Trans } from '@lingui/react'; <Plural id="UI.Dashboard.Widget.Header" _0={<Trans message="test" />} />;`,
      errors: [{ messageId: 'pluralComponentPropMustBeString' }],
    },
  ],
});
