/* eslint-env node */
/* eslint-disable @typescript-eslint/no-var-requires */
const { RuleTester } = require('eslint');

const rule = require('./enforce-translation-key-naming');

const ruleTester = new RuleTester({
  languageOptions: {
    parserOptions: {
      ecmaFeatures: { jsx: true },
    },
  },
});

ruleTester.run('translation-key-format', rule, {
  valid: [
    // Valid t usage
    {
      code: `import { t } from '@lingui/core/macro'; t({ id: 'FieldEditors.Home.Feature.Button' });`,
    },
    // Valid Trans usage
    {
      code: `import { Trans } from '@lingui/react'; <Trans id="FieldEditors.Dashboard.Widget.Header" />;`,
    },
    // Valid Plural usage
    {
      code: `import { Plural } from '@lingui/react/macro'; <Plural id="FieldEditors.Dashboard.Widget.Header" />;`,
    },
    // Valid Plural usage
    {
      code: `import { Plural, Trans } from '@lingui/react/macro'; <Plural id="FieldEditors.Dashboard.Widget.Header" other={<Trans>test</Trans>} />;`,
    },
    // Alias for t
    {
      code: `import { t as translate } from '@lingui/core/macro'; translate({ id: 'FieldEditors.About.Info.Section' });`,
    },
    // Alias for Trans
    {
      code: `import { Trans as T } from '@lingui/react'; <T id="FieldEditors.Account.Profile.Avatar" />;`,
    },
    // Alias for Plural
    {
      code: `import { Plural as P } from '@lingui/react/macro'; <P id="FieldEditors.Account.Profile.Avatar" />;`,
    },
    // F36 allowed in core/components
    {
      code: `// src/javascripts/core/components/SomeComponent.js import { t } from '@lingui/core/macro'; t({ id: 'F36.Some.Component.Key' });`,
    },
  ],

  invalid: [
    // Missing id in t
    {
      code: `import { t } from '@lingui/core/macro'; t({});`,
      errors: [{ messageId: 'missingId' }],
    },
    // Missing id in Trans (react)
    {
      code: `import { Trans } from '@lingui/react'; <Trans />;`,
      errors: [{ messageId: 'missingId' }],
    },
    // Missing id in Trans (macro)
    {
      code: `import { Trans } from '@lingui/react/macro'; <Trans />;`,
      errors: [{ messageId: 'missingId' }],
    },
    // Missing id in Trans alias (macro)
    {
      code: `import { Trans as T } from '@lingui/react/macro'; <T />;`,
      errors: [{ messageId: 'missingId' }],
    },
    // Missing id in Plural
    {
      code: `import { Plural } from '@lingui/react/macro'; <Plural />;`,
      errors: [{ messageId: 'missingId' }],
    },
    // Too few segments
    {
      code: `import { t } from '@lingui/core/macro'; t({ id: 'FieldEditors.Home' });`,
      errors: [{ messageId: 'tooFewSegments' }],
    },
    // Too many segments
    {
      code: `import { t } from '@lingui/core/macro'; t({ id: 'FieldEditors.Home.Feature.Extra.Button' });`,
      errors: [{ messageId: 'tooManySegments' }],
    },
    // Invalid project
    {
      code: `import { t } from '@lingui/core/macro'; t({ id: 'App.Home.Feature.Element' });`,
      errors: [{ messageId: 'invalidIdFormat' }],
    },
    // Not PascalCase (with autofix)
    {
      code: `import { t } from '@lingui/core/macro'; t({ id: 'FieldEditors.home-page.main_button.click' });`,
      output: `import { t } from '@lingui/core/macro'; t({ id: 'FieldEditors.HomePage.MainButton.Click' });`,
      errors: [{ messageId: 'invalidIdFormat' }],
    },
    // Alias for Trans with invalid format (with autofix)
    {
      code: `import { Trans as T } from '@lingui/react'; <T id="FieldEditors.welcome.screen.button" />;`,
      output: `import { Trans as T } from '@lingui/react'; <T id="FieldEditors.Welcome.Screen.Button" />;`,
      errors: [{ messageId: 'invalidIdFormat' }],
    },
    // Alias for Plural with invalid format (with autofix)
    {
      code: `import { Plural as P } from '@lingui/react/macro'; <P id="FieldEditors.welcome.screen.button" />;`,
      output: `import { Plural as P } from '@lingui/react/macro'; <P id="FieldEditors.Welcome.Screen.Button" />;`,
      errors: [{ messageId: 'invalidIdFormat' }],
    },
  ],
});
