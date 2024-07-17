import { getProviderName } from './getProviderName';

describe('getProviderName', () => {
  it('should return undefined if Resource Link is not in format "Provider:ResourceType"', () => {
    expect(getProviderName('This is not a correct resource link')).toBeUndefined();
  });

  it('should return the provider when format is Provider:ResourceType', () => {
    expect(getProviderName('Provider:ResourceType')).toBe('Provider');
  });
});
