import { getValidationForConfigFn } from './utils/validations'
import { allowedDefaultValueFieldType } from './allowed-default-value-field-type'
import { assetFileSize } from './asset-file-size'
import { assetImageDimensions } from './asset-image-dimensions'
import { dateRange } from './date-range'
import { enabledMarks } from './enabled-marks'
import { enabledNodeTypes } from './enabled-node-types'
import { hasHostname } from './has-hostname'
import { inValidation } from './in'
import { isValidMimeType } from './is-valid-mimetype'
import { linkContentType } from './link-content-type'
import { linkField } from './link-field'
import { linkMimetypeGroup } from './link-mimetype-group'
import { matchingDefaultFieldValueType } from './matching-default-field-value-type'
import { nodes, createNodeValidationFns, getNodeValidationForConfig } from './nodes'
import { present } from './present'
import { prohibitRegexp } from './prohibit-regexp'
import { range } from './range'
import { referencesFieldId } from './reference-field-id'
import { regexp } from './regexp'
import { relationshipType } from './relationship-type'
import { allowedResource } from './allowed-resource'
import { size } from './size'
import { unique } from './unique'
import { uniqueFieldApiNames } from './unique-field-api-names'
import { uniqueFieldIds } from './unique-field-ids'
import { validationDefined } from './validation-defined'
import { allowedResourcesRequired } from './allowed-resources-required'

export const createValidationFns = {
  allowedDefaultValueFieldType,
  allowedResourcesRequired,
  assetFileSize,
  assetImageDimensions,
  dateRange,
  enabledMarks,
  enabledNodeTypes,
  hasHostname,
  in: inValidation,
  isValidMimeType,
  linkContentType,
  linkField,
  linkMimetypeGroup,
  matchingDefaultFieldValueType,
  nodes,
  present,
  prohibitRegexp,
  range,
  referencesFieldId,
  regexp,
  relationshipType,
  allowedResource,
  size,
  unique,
  uniqueFieldApiNames,
  uniqueFieldIds,
  validationDefined,
}

export const getValidationForConfig = getValidationForConfigFn<[string | undefined]>(createValidationFns)

export { createNodeValidationFns, getNodeValidationForConfig }
