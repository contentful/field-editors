import { FieldExtensionSDK } from '../../packages/_shared/dist';
import { newReferenceEditorFakeSdk, ReferenceEditorSdkProps } from '../fixtures';

export { fixtures } from '../fixtures';

export function createReferenceEditorTestSdk(props?: ReferenceEditorSdkProps): FieldExtensionSDK {
  const [sdk] = newReferenceEditorFakeSdk(props);

  return sdk;
}
