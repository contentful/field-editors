import { size } from './size'
import { linkContentType } from './link-content-type'
import { allowedResources } from './allowed-resources'
import { getValidationForConfigFn } from '../utils/validations'
import { BLOCKS, INLINES } from '@contentful/rich-text-types'
import _ from 'lodash'
import { Validation } from '../../validation'

export const createNodeValidationFns = {
  size,
  linkContentType,
  allowedResources,
}

export const getNodeValidationForConfig = getValidationForConfigFn<[string]>(createNodeValidationFns)

export function nodes(params: Record<string, any>): Validation {
  const nodeTypesWithAllowedResourceValidation: string[] = [
    BLOCKS.EMBEDDED_RESOURCE,
    INLINES.EMBEDDED_RESOURCE,
    INLINES.RESOURCE_HYPERLINK,
  ]

  const getValidationsForNode = (nodeType: string, validationProps: any): Validation[] => {
    const getRulesForValidations = (validations: any[]): Validation[] => {
      if (!Array.isArray(validations)) {
        throw new TypeError('Expected validations to be an Array')
      }
      return validations.map((validationConfig) => getNodeValidationForConfig(validationConfig, nodeType))
    }

    if (nodeTypesWithAllowedResourceValidation.includes(nodeType)) {
      if (!validationProps || typeof validationProps !== 'object' || Array.isArray(validationProps)) {
        throw new TypeError(`Expected object as argument`)
      }
      return [
        ...getRulesForValidations(validationProps.validations),
        createNodeValidationFns.allowedResources(validationProps.allowedResources, nodeType),
      ]
    }
    return getRulesForValidations(validationProps)
  }

  const nodeValidations = _(params)
    .entries()
    .flatMap(([nodeType, validations]) => getValidationsForNode(nodeType, validations))
    .value()

  return Validation.fromValidationArray('nodes', nodeValidations)
}
