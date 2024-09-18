import * as dottie from 'dottie';
import _ from 'lodash';

export function createAssetLinkFileTestFn(fileTest: (file: any) => boolean) {
  return function test(assetLink: Record<string, any>, context: Record<string, any>): boolean {
    if (!context.includes) {
      return assetLink.sys.type === 'Link';
    }

    const asset = context.includes.Asset[assetLink.sys.id];
    const localizedFiles = dottie.get(asset, 'fields.file');

    if (!_.isObject(localizedFiles)) {
      return false;
    }

    return _.every(localizedFiles, fileTest);
  };
}
