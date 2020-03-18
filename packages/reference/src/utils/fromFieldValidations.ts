export type ReferenceValidations = {
  contentTypes?: string[];
  mimetypeGroups?: string[];
};

export function fromFieldValidations(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  validations: Record<string, any>[] = []
): ReferenceValidations {
  const linkContentTypeValidations = validations.find(v => 'linkContentType' in v);
  const linkMimetypeGroupValidations = validations.find(v => 'linkMimetypeGroup' in v);

  const result: ReferenceValidations = {
    contentTypes: linkContentTypeValidations?.linkContentType ?? undefined,
    mimetypeGroups: linkMimetypeGroupValidations?.linkMimetypeGroup ?? undefined
    // todo: there are multiple BE problems that need to be solved first, for now we don't want to apply size constraints
    // linkedFileSize: findValidation(field, 'assetFileSize', {}),
    // linkedImageDimensions: findValidation(field, 'assetImageDimensions', {})
  };

  return result;
}
