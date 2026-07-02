Cypress.Commands.overwrite('checkA11y', (originalFn, ...args) => {
  const [context, options, violationCallback, skipFailures] = args;

  // Inject and configure axe lazily — doing this in cy.mount() interferes with async
  // React context provider trees and breaks tests that rely on context values.
  cy.window({ log: false }).then((win) => {
    if (!win.axe) {
      cy.injectAxe({ axeCorePath: 'node_modules/axe-core/axe.min.js' });
      cy.configureAxe({
        rules: [
          { id: 'html-has-lang', enabled: false },
          { id: 'landmark-one-main', enabled: false },
          { id: 'page-has-heading-one', enabled: false },
          { id: 'region', enabled: false },
        ],
      });
    }
  });

  const logViolations: typeof violationCallback = (violations) => {
    const summary = violations.map((v) => `  [${v.impact}] ${v.id}: ${v.description}`).join('\n');
    cy.task('log', `\n${violations.length} accessibility violation(s) detected:\n${summary}\n`);
    violationCallback?.(violations);
  };

  return originalFn(context, options, logViolations, skipFailures);
});
