export type ReferenceValidations = {
  contentTypes?: string[];
};

export function fromFieldValidations(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  validations: Record<string, any>[] = []
): ReferenceValidations {
  const linkContentTypeValidations = validations.find(v => 'linkContentType' in v);

  const result: ReferenceValidations = {
    contentTypes: linkContentTypeValidations?.linkContentType ?? undefined
  };

  return result;
}
