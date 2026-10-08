const keyCodes: Record<string, number> = {
  ArrowUp: 38,
  ArrowDown: 40,
  ArrowLeft: 37,
  ArrowRight: 39,
  Backspace: 8,
  Delete: 46,
  Enter: 13,
  Tab: 9,
};

export const keyModifiers = {
  command: Cypress.platform === 'darwin' ? 4 : 2,
  alt: 1,
  shift: 8,
};

// Dispatch native keys so the browser moves its selection. cy.type() does not
// reproduce the race between that selection and Slate's pending update.
export const pressNativeKey = (key: string, modifiers = 0) => {
  const isControlKey = key in keyCodes;
  const code = isControlKey ? key : /^\d$/.test(key) ? `Digit${key}` : `Key${key.toUpperCase()}`;
  const insertedText = key === 'Enter' ? '\r' : key;
  const insertsText = (!isControlKey || key === 'Enter') && !modifiers;

  for (const type of ['keyDown', 'keyUp']) {
    cy.then(() =>
      Cypress.automation('remote:debugger:protocol', {
        command: 'Input.dispatchKeyEvent',
        params: {
          type: isControlKey && key !== 'Enter' && type === 'keyDown' ? 'rawKeyDown' : type,
          key,
          code,
          windowsVirtualKeyCode: keyCodes[key] ?? key.toUpperCase().charCodeAt(0),
          modifiers,
          ...(insertsText && type === 'keyDown'
            ? { text: insertedText, unmodifiedText: insertedText }
            : {}),
        },
      }),
    );
  }
};

export const expectNativeCaret = (value: string, offset?: number) => {
  cy.window().should((win) => {
    expect(win.getSelection()?.anchorNode?.textContent).to.equal(value);
    if (offset !== undefined) expect(win.getSelection()?.anchorOffset).to.equal(offset);
  });
};

export const expectParagraphCaret = (value: string, offset: number) => {
  cy.window().should((win) => {
    const selection = win.getSelection()!;
    const paragraph = selection.anchorNode!.parentElement!.closest('[data-slate-node="element"]')!;
    expect(paragraph.textContent!.replace(/\uFEFF/g, '')).to.equal(value);
    const beforeCaret = win.document.createRange();
    beforeCaret.setStart(paragraph, 0);
    beforeCaret.setEnd(selection.anchorNode!, selection.anchorOffset);
    expect(beforeCaret.toString().replace(/\uFEFF/g, '').length).to.equal(offset);
  });
};

export const pauseSelectionUpdates = () => {
  // Settle the initial focus, then keep timers paused during native input.
  cy.clock();
  cy.tick(100);
};

export const resumeSelectionUpdates = () => {
  // Flush the pending selection update and debounced field save.
  cy.tick(600);
  cy.clock().then((clock) => clock.restore());
};
