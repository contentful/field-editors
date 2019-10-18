import { JSONObject } from './types';

export function stringifyJSON(obj: JSONObject | null | undefined): string {
  if (obj === null || obj === undefined) {
    return '';
  } else {
    return JSON.stringify(obj, null, 4);
  }
}

export function isValidJson(str: string) {
  let parsed;
  try {
    parsed = JSON.parse(str);
  } catch (e) {
    return false;
  }
  // An object or array is valid JSON
  if (typeof parsed !== 'object') {
    return false;
  }
  return true;
}

export function parseJSON(str: string): { valid: boolean; value?: JSONObject } {
  if (str === '') {
    return {
      value: undefined,
      valid: true
    };
  } else if (isValidJson(str)) {
    return {
      value: JSON.parse(str),
      valid: true
    };
  } else {
    return {
      value: undefined,
      valid: false
    };
  }
}
