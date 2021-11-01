export const urlRegex =
  /^(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-/]))?$/;

export function isValidUrl(value: string) {
  return urlRegex.test(value);
}
