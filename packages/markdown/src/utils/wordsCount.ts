const wordRegex = /[a-zA-Z0-9_'\u0392-\u03c9\u0400-\u04FF\u0027]+|[\u4E00-\u9FFF\u3400-\u4dbf\uf900-\ufaff\u3040-\u309f\uac00-\ud7af\u0400-\u04FF]+|[\u00E4\u00C4\u00E5\u00C5\u00F6\u00D6]+|[\u0531-\u0556\u0561-\u0586\u0559\u055A\u055B]+|\w+/g;

const matchWords = (str: string) => {
  return str.match(wordRegex);
};

export const wordsCount = (str: string) => {
  const m = matchWords(str);
  if (!m) return 0;
  return m.length;
};
