import _ from 'lodash'
import mimetype from '@contentful/mimetype'
import { Validation } from '../validation'
import { createAssetLinkFileTestFn } from './utils/asset'

export function linkMimetypeGroup(mimetypeGroups: string | string[]): Validation {
  if (_.isString(mimetypeGroups)) {
    mimetypeGroups = [mimetypeGroups]
  }

  if (!_.isArray(mimetypeGroups)) {
    throw new TypeError('Expected String or Array for ' + 'linkMimetypeGroup validation')
  }

  if (_.isEmpty(mimetypeGroups)) {
    throw new Error('Need at least one Mime Type group name ' + 'for linkMimetypeGroup validation')
  }

  function inMimetypeGroups(file: Record<string, any>): boolean {
    if (!file) {
      return false
    }

    const assetMimetypeGroup = mimetype.getGroupLabel({
      type: file.contentType,
      fallbackExt: mimetype.getExtension(file.fileName),
    })

    return _.includes(mimetypeGroups, assetMimetypeGroup)
  }

  return Validation.fromTestFunction('linkMimetypeGroup', createAssetLinkFileTestFn(inMimetypeGroups), {
    mimetypeGroupName: mimetypeGroups,
    params: mimetypeGroups,
  })
}
