import { Validation } from '../validation';

export function isLinkField<T extends { type: string; linkType?: string } = any>(
  field: T
): field is T & { type: 'Link'; linkType: 'Entry' | 'Asset' } {
  return (
    field.type === 'Link' &&
    field.linkType !== undefined &&
    ['Entry', 'Asset'].includes(field.linkType)
  );
}

export function linkField(): Validation {
  function test(value: { type: string; linkType: string }): boolean {
    return value.type !== 'Link' || isLinkField(value);
  }

  return Validation.fromTestFunction('linkField', test);
}
