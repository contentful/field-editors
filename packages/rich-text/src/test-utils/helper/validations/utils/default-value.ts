const ALLOWED_ARRAY_ITEMS_TYPES = new Set(['Symbol']);
const ALLOWED_DEFAULT_VALUE_TYPES = new Set([
  'Text',
  'Symbol',
  'Date',
  'Number',
  'Integer',
  'Boolean',
]);

export function isDefaultValueSupported(field: any): boolean | undefined {
  return (
    ALLOWED_DEFAULT_VALUE_TYPES.has(field.type) ||
    (field.type === 'Array' && field.items && ALLOWED_ARRAY_ITEMS_TYPES.has(field.items.type))
  );
}
