/* eslint-disable */
import _ from 'lodash';

type FieldValue = any;
type Fields = Record<string, FieldValue>;

/**
 * This builds a list of field locales allowed by the schema,
 * and ensures that any locale codes that are not in that list
 * will not be present in the returned entry/asset.
 *
 * To be only used with the skipDeletedLocaleFieldValidation
 * context flag.
 */
function removeDeletedLocales(
  allowedInternalLocaleCodes: string[],
  _data: { fields: Fields }
): { fields: Fields } {
  const data = _.cloneDeep(_data);

  _.each(data.fields, function (field) {
    Object.keys(field || {}).forEach(function (internalLocaleCode) {
      if (!_.includes(allowedInternalLocaleCodes, internalLocaleCode)) {
        delete field[internalLocaleCode];
      }
    });
  });

  return data;
}

/**
 * This function checks if the passed thing is an Asset or Entry by
 * reading it's `sys.type` property.
 */
function isAssetOrEntry(thing: Record<string, any>): boolean {
  return !!thing.sys && _.includes(['Asset', 'Entry'], thing.sys.type);
}

function hasFieldsObject(thing: Record<string, any>): thing is { fields: Fields } {
  return _.isObject(thing.fields) && Object.values(thing.fields).every(_.isObject);
}

export { removeDeletedLocales, isAssetOrEntry, hasFieldsObject };
