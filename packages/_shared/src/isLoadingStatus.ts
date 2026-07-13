export function isLoadingStatus(status: string | undefined): boolean {
  return status === 'loading' || status === 'idle' || status === 'pending';
}
