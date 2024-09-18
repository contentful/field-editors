import _, { CollectionChain } from 'lodash'
import { Block, Inline, Text } from '@contentful/rich-text-types'

export function getNodesByType(
  nodeList: CollectionChain<Block | Inline | Text> | any,
  nodeType: string
): CollectionChain<Block | Inline | Text> | any {
  return (nodeList || _.chain([])).reduce(
    (accNodes: any, node: any) =>
      node.nodeType === nodeType ? [...accNodes, node] : [...accNodes, ...getNodesByType(node.content, nodeType)],
    []
  )
}
