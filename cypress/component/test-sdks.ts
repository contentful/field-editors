import { FieldExtensionSDK } from '../../packages/_shared/dist';
import changedAsset from '../../packages/reference/src/__fixtures__/changed_asset.json';
import changedEntry from '../../packages/reference/src/__fixtures__/changed_entry.json';
import emptyAsset from '../../packages/reference/src/__fixtures__/empty_asset.json';
import emptyEntry from '../../packages/reference/src/__fixtures__/empty_entry.json';
import { newReferenceEditorFakeSdk } from '../../packages/reference/src/__fixtures__/FakeSdk';
import { ReferenceEditorSdkProps } from '../../packages/reference/src/__fixtures__/FakeSdk';
import invalidAsset from '../../packages/reference/src/__fixtures__/invalid_asset.json';
import invalidEntry from '../../packages/reference/src/__fixtures__/invalid_entry.json';
import publishedAsset from '../../packages/reference/src/__fixtures__/published_asset.json';
import publishedEntry from '../../packages/reference/src/__fixtures__/published_entry.json';

const fixtures = {
  entry: {
    changed: changedEntry,
    empty: emptyEntry,
    published: publishedEntry,
    invalid: invalidEntry,
  },
  asset: {
    changed: changedAsset,
    empty: emptyAsset,
    published: publishedAsset,
    invalid: invalidAsset,
  },
};
export { fixtures };

export function createReferenceEditorTestSdk(props?: ReferenceEditorSdkProps): FieldExtensionSDK {
  const [sdk] = newReferenceEditorFakeSdk(props);

  return sdk;
}
