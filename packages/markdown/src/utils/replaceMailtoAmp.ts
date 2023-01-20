// This code will replace '&amp;' with '&' only inside the href attribute of the mailto link.
// Otherwise the mailto link will not work correctly
export const replaceMailtoAmp = (string: string) => {
  return string.replace(/href="mailto:[^"]*&amp;/g, function (match) {
    return match.replace(/&amp;/g, '&');
  });
};
