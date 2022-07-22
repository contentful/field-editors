import changedAsset from '../../packages/reference/src/__fixtures__/changed_asset.json';
import changedEntry from '../../packages/reference/src/__fixtures__/changed_entry.json';
import emptyAsset from '../../packages/reference/src/__fixtures__/empty_asset.json';
import emptyEntry from '../../packages/reference/src/__fixtures__/empty_entry.json';
import { newReferenceEditorFakeSdk } from '../../packages/reference/src/__fixtures__/FakeSdk';
import { ReferenceEditorSdkProps } from '../../packages/reference/src/__fixtures__/FakeSdk';
import publishedAsset from '../../packages/reference/src/__fixtures__/published_asset.json';
import publishedEntry from '../../packages/reference/src/__fixtures__/published_entry.json';

const fixtures = {
  entry: {
    changed: changedEntry,
    empty: emptyEntry,
    published: publishedEntry,
  },
  asset: {
    changed: changedAsset,
    empty: emptyAsset,
    published: publishedAsset,
  },
};
export { fixtures };

export function createReferenceEditorTestSdk(props?: ReferenceEditorSdkProps) {
  const [sdk] = newReferenceEditorFakeSdk(props);

  return sdk;
}
