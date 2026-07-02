export function t(obj: { id?: string; message: string } | string): string {
  if (typeof obj === 'object' && obj.message !== undefined) {
    return obj.message;
  }
  return String(obj);
}

export function plural(
  count: number,
  forms: { one?: string; other?: string; [key: string]: string | undefined },
): string {
  const form = count === 1 ? 'one' : 'other';
  const template = String(forms[form] ?? forms.other ?? forms.one ?? '');
  return template.replace(/#/g, String(count)).replace(/\{count\}/g, String(count));
}
