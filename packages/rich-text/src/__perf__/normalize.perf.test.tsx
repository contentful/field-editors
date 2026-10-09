// Manual perf harness: PERF=1 yarn vitest run src/__perf__
import { describe, it } from 'vitest';

import { toSlateDoc } from '../helpers/toSlateDoc';
import { createTestEditor } from '../test-utils';
import { makeDoc } from './makeDoc';

describe.runIf(process.env.PERF)('normalize perf', () => {
  it('force-normalizes a 2000-block document', () => {
    const { editor } = createTestEditor({});
    const runs: number[] = [];
    for (let i = 0; i < 5; i++) {
      editor.children = toSlateDoc(makeDoc(2000) as any);
      const t = performance.now();
      editor.tf.normalize({ force: true });
      runs.push(performance.now() - t);
    }
    runs.sort((a, b) => a - b);
    // eslint-disable-next-line no-console -- benchmark output
    console.log(
      `[perf] normalize median=${runs[2].toFixed(0)}ms runs=${runs.map((r) => r.toFixed(0))}`,
    );
  });
});
