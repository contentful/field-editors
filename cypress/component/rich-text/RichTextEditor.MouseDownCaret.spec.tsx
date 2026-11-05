import * as React from 'react';
import { flushSync } from 'react-dom';

import { getCypressElementCoordinates } from 'cypress-real-events/getCypressElementCoordinates';

import { RichTextEditor } from '../../../packages/rich-text/src';
import { document as doc } from '../../../packages/rich-text/src/helpers/nodeFactory';
import { toSlateDoc } from '../../../packages/rich-text/src/helpers/toSlateDoc';
import { Plate, PlateContent } from '../../../packages/rich-text/src/internal/plate';
import { createPlateEditor } from '../../../packages/rich-text/src/internal/pluginAdapter';
import { getPlugins } from '../../../packages/rich-text/src/plugins';
import { SyncNativeSelection } from '../../../packages/rich-text/src/SyncNativeSelection';
import { createRichTextFakeSdk } from '../../fixtures';
import { mount } from '../mount';
import { pauseSelectionUpdates, resumeSelectionUpdates } from './caretTestUtils';
import { entryBlock, paragraphWithText } from './helpers';
import { RichTextPage } from './RichTextPage';

const dispatch = (command: string, params: object) =>
  Cypress.automation('remote:debugger:protocol', { command, params });

const mouse = (type: string, point: { x: number; y: number }) =>
  dispatch('Input.dispatchMouseEvent', {
    type,
    ...point,
    button: 'left',
    buttons: type === 'mousePressed' ? 1 : 0,
    clickCount: 1,
  });

const keyParams = (key: string) => ({
  key,
  code: key.length === 1 ? `Key${key.toUpperCase()}` : key,
  windowsVirtualKeyCode:
    { Backspace: 8, Enter: 13, ArrowLeft: 37 }[key] ?? key.toUpperCase().charCodeAt(0),
});

const keyDown = (key: string) =>
  dispatch('Input.dispatchKeyEvent', {
    type: ['Backspace', 'ArrowLeft'].includes(key) ? 'rawKeyDown' : 'keyDown',
    ...keyParams(key),
    ...(key.length === 1 || key === 'Enter' ? { text: key === 'Enter' ? '\r' : key } : {}),
  });
const keyUp = (key: string) =>
  dispatch('Input.dispatchKeyEvent', { type: 'keyUp', ...keyParams(key) });
const typeNative = async (key: string) => {
  await keyDown(key);
  await keyUp(key);
};
const pause = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const blockMainThread = (win: Window, ms: number) => {
  const start = win.performance.now();
  while (win.performance.now() - start < ms) {
    // Simulate synchronous work without pausing Slate's real selection timers.
  }
};

describe(
  'Native mouse caret before mouse-up',
  { browser: 'chrome', viewportWidth: 1000, viewportHeight: 900, retries: 0 },
  () => {
    it('honors a deliberate model selection made before the host render', () => {
      const sdk = createRichTextFakeSdk();
      const editor = createPlateEditor({
        plugins: getPlugins(sdk, () => undefined, undefined, false, true),
        value: toSlateDoc(
          doc(paragraphWithText('Old paragraph'), paragraphWithText('Clicked paragraph')),
        ),
      });
      let armed = false;
      let before: string | null;
      const Host = () => {
        const [, render] = React.useReducer((n) => n + 1, 0);
        return (
          <div
            role="presentation"
            onMouseDown={(event) => {
              if (!armed) return;
              const win = event.currentTarget.ownerDocument.defaultView!;
              win.setTimeout(() => {
                before = win.getSelection()?.anchorNode?.textContent ?? null;
                editor.tf.select({ path: [0, 0], offset: 0 });
                flushSync(render);
              }, 0);
            }}>
            <Plate editor={editor}>
              <SyncNativeSelection editor={editor} />
              <PlateContent />
            </Plate>
          </div>
        );
      };
      mount(<Host />);
      cy.get('[data-slate-editor="true"]').then(async ($root) => {
        const root = $root[0];
        const source = getCypressElementCoordinates(
          Cypress.$(root.children[0]),
          { x: 1, y: 12 },
          false,
        );
        const target = getCypressElementCoordinates(
          Cypress.$(root.children[1]),
          { x: 45, y: 12 },
          false,
        );
        await mouse('mousePressed', source);
        await mouse('mouseReleased', source);
        await typeNative('a');
        armed = true;
        await mouse('mousePressed', target);
        await pause(60);
        await mouse('mouseReleased', target);
        await typeNative('x');
      });
      cy.then(() =>
        expect(before, 'native click first reached the target').to.equal('Clicked paragraph'),
      );
      cy.get('[data-slate-editor="true"]').children().eq(0).should('have.text', 'xaOld paragraph');
      cy.window().should((win) => {
        expect(win.getSelection()?.anchorNode?.textContent).to.equal('xaOld paragraph');
        expect(editor.selection?.anchor).to.deep.equal({ path: [0, 0], offset: 1 });
      });
    });

    it('keeps an unfocused card selected through a host render', () => {
      const sdk = createRichTextFakeSdk({
        initialValue: doc(entryBlock(), paragraphWithText('Body')),
      });
      const Host = () => {
        const [, render] = React.useReducer((n) => n + 1, 0);
        return (
          <>
            <button onClick={() => render()}>Render host</button>
            <RichTextEditor
              sdk={sdk}
              isInitiallyDisabled={false}
              withSelectionSync
              onAction={() => undefined}
            />
          </>
        );
      };
      mount(<Host />);
      const page = new RichTextPage();
      cy.findByTestId('cf-ui-entry-card').should('be.visible');
      page.editor.findByText('Body').click();
      page.editor.type('{home}');
      pauseSelectionUpdates();
      cy.findByTestId('cf-ui-entry-card').click();
      // Rerender without replacing the card's selection or moving focus.
      cy.contains('button', 'Render host').trigger('click');
      page.editor.trigger('cut', {
        eventConstructor: 'ClipboardEvent',
        clipboardData: new DataTransfer(),
      });
      resumeSelectionUpdates();
      page.expectValue(doc(paragraphWithText('Body')));
    });

    it('keeps the caret and next edit after an external value update with syncing enabled', () => {
      const sdk = createRichTextFakeSdk({
        initialValue: doc(paragraphWithText('Old paragraph'), paragraphWithText('Target')),
      });
      mount(<RichTextEditor sdk={sdk} isInitiallyDisabled={false} withSelectionSync />);
      const page = new RichTextPage();
      page.editor.findByText('Target').click();
      page.editor.type('{end}!');
      page.expectValue(doc(paragraphWithText('Old paragraph'), paragraphWithText('Target!')));
      // The fake field emits onValueChanged just like an incoming SDK update.
      cy.then(() =>
        sdk.field.setValue(
          doc(paragraphWithText('Updated elsewhere'), paragraphWithText('Target!')),
        ),
      );
      page.editor.findByText('Updated elsewhere').should('be.visible');
      page.editor.then(() => typeNative('x'));
      page.expectValue(doc(paragraphWithText('Updated elsewhere'), paragraphWithText('Target!x')));
      cy.window().should((win) => {
        expect(win.getSelection()?.anchorNode?.textContent).to.equal('Target!x');
        expect(win.getSelection()?.anchorOffset).to.equal(8);
      });
    });

    for (const scenario of [
      { name: 'an immediate host render', workMs: 0, sync: true },
      { name: 'a slow host render', workMs: 300, sync: true },
      { name: 'an overdue host render after Enter', edit: 'Enter', sync: true },
      { name: 'an overdue host render after Backspace', edit: 'Backspace', sync: true },
      { name: 'the existing behavior with syncing disabled', workMs: 0, sync: false },
    ]) {
      it(`handles ${scenario.name}`, () => {
        const sdk = createRichTextFakeSdk({
          initialValue: doc(
            ...Array.from({ length: 8 }, (_, i) => paragraphWithText(`Paragraph ${i}`)),
          ),
        });
        let armed = false;
        let before: string | null;
        let after: string | null;
        let clickedBlock: Element;
        let inputDelay = 0;
        const Host = () => {
          const [revision, render] = React.useReducer((n) => n + 1, 0);
          React.useLayoutEffect(() => {
            if (revision) blockMainThread(window, scenario.workMs ?? 0);
          }, [revision]);
          const scheduleRender = (win: Window) => {
            win.setTimeout(() => {
              const selection = win.getSelection();
              before = selection?.anchorNode?.textContent ?? null;
              clickedBlock = selection!.anchorNode!.parentElement!.closest(
                '[data-slate-node="element"]',
              )!;
              flushSync(render);
              after = win.getSelection()?.anchorNode?.textContent ?? null;
            }, 0);
          };
          return (
            <div
              role="presentation"
              onMouseDown={(event) => {
                if (!armed) return;
                const win = event.currentTarget.ownerDocument.defaultView!;
                inputDelay = win.performance.now() - event.timeStamp;
                if (!scenario.edit) scheduleRender(win);
              }}
              onKeyDownCapture={(event) => {
                if (!armed || event.key !== scenario.edit) return;
                const win = event.currentTarget.ownerDocument.defaultView!;
                // This timer predates mouse-down: a mouse-down sync timer alone
                // cannot beat this independently queued host update.
                scheduleRender(win);
                blockMainThread(win, 900);
              }}>
              {/* A new callback forces an editor render without replacing its value. */}
              <RichTextEditor
                sdk={sdk}
                isInitiallyDisabled={false}
                withSelectionSync={scenario.sync}
                onAction={() => undefined}
              />
            </div>
          );
        };
        mount(<Host />);
        const page = new RichTextPage();
        page.editor.then(async ($root) => {
          const root = $root[0];
          const source = getCypressElementCoordinates(
            Cypress.$(root.children[2]),
            { x: 1, y: 12 },
            false,
          );
          const target = getCypressElementCoordinates(
            Cypress.$(root.children[4]),
            { x: 45, y: 12 },
            false,
          );
          await mouse('mousePressed', source);
          await mouse('mouseReleased', source);
          await typeNative('a');
          if (scenario.edit) await typeNative('ArrowLeft');
          armed = true;
          if (scenario.edit) {
            // Submit input while the renderer is still busy; awaiting the edit
            // first would hide the customer's queued-input ordering.
            await Promise.all([
              keyDown(scenario.edit),
              keyUp(scenario.edit),
              mouse('mousePressed', target),
            ]);
          } else {
            await mouse('mousePressed', target);
          }
          // Hold native mouse-down across the pending render. No fake timers,
          // DOM selection assignments or Slate selection mutations are used.
          await pause(60);
          await mouse('mouseReleased', target);
          await typeNative('x');
        });
        cy.then(() => {
          expect(before, 'native click reached a different paragraph before render').to.match(
            /^Paragraph [345]$/,
          );
          if (scenario.edit) {
            expect(inputDelay, 'click queued behind synchronous edit work').to.be.greaterThan(400);
          }
          if (scenario.sync) {
            expect(after, 'render retained the native click').to.equal(before);
          } else {
            expect(after, 'no new restoration guard when flag is off').not.to.equal(before);
          }
        });
        if (scenario.sync) {
          cy.then(() => cy.wrap(clickedBlock).should('contain.text', 'x'));
          cy.window().should((win) => {
            expect(
              win.getSelection()?.anchorNode?.parentElement?.closest('[data-slate-node="element"]'),
            ).to.equal(clickedBlock);
          });
          cy.getRichTextField()
            .invoke('getValue')
            .should((saved) => {
              expect(
                saved.content.filter((node) =>
                  node.content.some((leaf) => 'value' in leaf && leaf.value.includes('x')),
                ),
              ).to.have.length(1);
              const paragraph = saved.content.find((node) =>
                node.content.some((leaf) => 'value' in leaf && leaf.value.includes('x')),
              );
              expect(paragraph!.content[0].value.replace('x', '')).to.equal(before);
            });
        }
      });
    }
  },
);
