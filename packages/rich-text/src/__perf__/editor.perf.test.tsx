// Manual perf harness: PERF=1 yarn vitest run src/__perf__
import * as React from 'react';

import { act, render } from '@testing-library/react';
import { describe, it } from 'vitest';

import { newReferenceEditorFakeSdk } from '../__fixtures__/FakeSdk';
import { getContentfulEditorId } from '../ContentfulEditorProvider';
import { ConnectedRichTextEditor } from '../RichTextEditor';
import { makeDoc } from './makeDoc';

// Optional CPU profile of the typing loop only: PERF_PROFILE=/tmp/x.cpuprofile
async function startProfile(file: string) {
  const { Session } = await import('node:inspector/promises');
  const { writeFileSync } = await import('node:fs');
  const session = new Session();
  session.connect();
  await session.post('Profiler.enable');
  await session.post('Profiler.start');
  return async () => {
    const { profile } = await session.post('Profiler.stop');
    writeFileSync(file, JSON.stringify(profile));
    session.disconnect();
  };
}

const BLOCK_COUNT = 300;
const KEYSTROKES = 100;

describe.runIf(process.env.PERF)('rich text perf', () => {
  it(`types ${KEYSTROKES} chars into a ${BLOCK_COUNT}-block document`, async () => {
    const [baseSdk] = newReferenceEditorFakeSdk();
    const sdk: any = {
      ...baseSdk,
      entry: { getSys: () => ({ id: 'entry-id' }) },
      locales: { ...baseSdk.locales, direction: {} },
      access: { can: async () => true },
      parameters: { instance: {} },
    };
    const doc = makeDoc(BLOCK_COUNT);

    let editor: any;
    const mountProfile = process.env.PERF_PROFILE_MOUNT
      ? await startProfile(process.env.PERF_PROFILE_MOUNT)
      : undefined;
    const t0 = performance.now();
    let renderMs = 0;
    let commits = 0;
    const onRender = (_id: string, _phase: string, actual: number) => {
      renderMs += actual;
      commits++;
    };
    const result = render(
      <React.Profiler id="rte" onRender={onRender}>
        <ConnectedRichTextEditor sdk={sdk} value={doc as any} />
      </React.Profiler>,
    );
    await act(async () => {
      await new Promise((r) => setTimeout(r, 50));
    });
    const mountMs = performance.now() - t0;
    await mountProfile?.();

    // Walk up the React fiber tree from the editable to find the editor instance
    const id = getContentfulEditorId(sdk);
    const el = result.container.querySelector(`#${CSS.escape(id)}`);
    const fiberKey = Object.keys(el!).find((k) => k.startsWith('__reactFiber'))!;
    let fiber = (el as any)[fiberKey];
    while (fiber && !editor) {
      const v = fiber.memoizedProps?.editor;
      if (v?.children) editor = v;
      fiber = fiber.return;
    }

    const point = { path: [0, 0], offset: 3 };
    editor.tf.select(point);

    renderMs = 0;
    commits = 0;
    const profile = process.env.PERF_PROFILE
      ? await startProfile(process.env.PERF_PROFILE)
      : undefined;
    const t1 = performance.now();
    for (let i = 0; i < KEYSTROKES; i++) {
      await act(async () => {
        editor.tf.insertText('x');
      });
    }
    const typeMs = performance.now() - t1;
    await profile?.();
    const typedRenderMs = renderMs;
    const typedCommits = commits;
    if (!el!.textContent!.includes('Parxxx')) throw new Error('typing did not reach the DOM');

    // eslint-disable-next-line no-console -- benchmark output
    console.log(
      `[perf] mount=${mountMs.toFixed(0)}ms type=${typeMs.toFixed(0)}ms ` +
        `perKey=${(typeMs / KEYSTROKES).toFixed(2)}ms ` +
        `reactRender=${typedRenderMs.toFixed(0)}ms commits=${typedCommits}`,
    );
    result.unmount();
  }, 120000);
});
