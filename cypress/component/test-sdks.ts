import { ReferenceEditorSdkProps } from '../../packages/reference/src/__fixtures__/FakeSdk';
import { newReferenceEditorFakeSdk } from '../../packages/reference/src/__fixtures__/FakeSdk';

export function createReferenceEditorTestSdk(props?: ReferenceEditorSdkProps) {
  const [sdk] = newReferenceEditorFakeSdk(props);

  return sdk;
}
