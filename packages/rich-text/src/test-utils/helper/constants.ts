import { BLOCKS, INLINES } from '@contentful/rich-text-types'

/**
 * For many years this has been the default environment Id and it's the default
 * whenever an environment Id is not explicitly mentioned (in URLs or other resources)
 */
export const DEFAULT_ENVIRONMENT_ID = 'master'
export const RICH_TEXT_RESOURCE_LINKS_NODE_TYPES = [
  BLOCKS.EMBEDDED_RESOURCE,
  INLINES.EMBEDDED_RESOURCE,
  INLINES.RESOURCE_HYPERLINK,
] as const
