export function getProviderName(resourceLink: string): string | undefined {
  if (resourceLink.indexOf(':') === -1) {
    return undefined;
  }
  const [provider] = resourceLink.split(':');

  return provider;
}
