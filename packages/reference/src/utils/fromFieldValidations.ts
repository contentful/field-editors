import { FieldAPI } from '@contentful/app-sdk';
import isNumber from 'lodash/isNumber';

type NumberOfLinksValidation =
  | { type: 'min-max'; min: number; max: number }
  | { type: 'min'; min: number; max: undefined }
  | { type: 'max'; max: number; min: undefined };

export type ReferenceValidations = {
  contentTypes?: string[];
  mimetypeGroups?: string[];
  numberOfLinks?: NumberOfLinksValidation;
};

export function fromFieldValidations(field: FieldAPI): ReferenceValidations {
  // eslint-disable-next-line -- TODO: describe this disable  @typescript-eslint/no-explicit-any
  const validations: Record<string, any>[] = [
    ...field.validations,
    ...(field.items?.validations ?? []),
  ];
  const linkContentTypeValidations = validations.find((v) => 'linkContentType' in v);
  const linkMimetypeGroupValidations = validations.find((v) => 'linkMimetypeGroup' in v);
  const sizeValidations = validations.find((v) => 'size' in v);
  const size = (sizeValidations && sizeValidations.size) || {};
  const min = size.min;
  const max = size.max;

  let numberOfLinks: NumberOfLinksValidation | undefined = undefined;

  if (isNumber(min) && isNumber(max)) {
    numberOfLinks = {
      type: 'min-max',
      min,
      max,
    };
  } else if (isNumber(min)) {
    numberOfLinks = {
      type: 'min',
      min,
      max: undefined,
    };
  } else if (isNumber(max)) {
    numberOfLinks = {
      type: 'max',
      max,
      min: undefined,
    };
  }

  const result: ReferenceValidations = {
    contentTypes: linkContentTypeValidations?.linkContentType ?? undefined,
    mimetypeGroups: linkMimetypeGroupValidations?.linkMimetypeGroup ?? undefined,
    numberOfLinks,
    // todo: there are multiple BE problems that need to be solved first, for now we don't want to apply size constraints
    // linkedFileSize: findValidation(field, 'assetFileSize', {}),
    // linkedImageDimensions: findValidation(field, 'assetImageDimensions', {})
  };

  return result;
}
