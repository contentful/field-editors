import { i18n } from '@lingui/core';
import { cleanup } from '@testing-library/react';
import { afterEach, expect } from 'vitest';
import '@testing-library/jest-dom/vitest';
import * as matchers from 'vitest-axe/matchers';

i18n.activate('en-US');

expect.extend(matchers);

afterEach(() => {
  cleanup();
});
