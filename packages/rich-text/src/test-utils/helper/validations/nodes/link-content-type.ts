import _ from 'lodash'
import { Block, Inline } from '@contentful/rich-text-types'
import { getNodesByType } from '../utils/nodes'
import { Validation } from '../../validation'

export function linkContentType(contentTypeId: string | string[], nodeType: string): Validation {
  if (_.isString(contentTypeId)) {
    contentTypeId = [contentTypeId]
  }

  if (!_.isArray(contentTypeId) || !_.every(contentTypeId, _.isString)) {
    throw new TypeError('Expected String or Array<String> as linkContentType validation argument')
  }

  if (_.isEmpty(contentTypeId)) {
    throw new Error('Need at least one allowed Content Type')
  }

  const test = (rootNode: Block | Inline, context: Record<string, any>): boolean => {
    const nodesLazy = _.chain(rootNode.content)

    // Note that this evaluates to a lazily-evaluated lodash chain, not a
    // native JS array. That's why we're running further operations and
    // grabbing the .value() below.
    const linksLazy = getNodesByType(nodesLazy, nodeType).map('data.target.sys')

    if (!context || !context.includes) {
      return linksLazy.every({ type: 'Link' }).value()
    }

    const linkedEntryIds = linksLazy.map('id').value()

    return linkedEntryIds.every((entryId: string) => {
      const entry = context.includes.Entry[entryId]
      return entry && contentTypeId.includes(entry.sys.contentType.sys.id)
    })
  }

  return Validation.fromTestFunction('linkContentType', test, {
    contentTypeId,
    params: contentTypeId,
    type: 'nodeValidation',
  })
}
