import get from 'lodash/get';
import isObject from 'lodash/isObject';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Asset = any;

type LinkWithMedia = {
  title: string;
  asset: Asset;
  url: string;
  isLocalized: boolean;
  isFallback: boolean;
  asMarkdown: string;
};

type Locales = {
  localeCode: string;
  fallbackCode: string | undefined;
  defaultLocaleCode: string;
};

function normalizeWhiteSpace(str: string) {
  if (str) {
    return str.trim().replace(/\s{2,}/g, ' ');
  } else {
    return str;
  }
}

function removeExtension(str: string) {
  return str.replace(/\.\w+$/g, '');
}

function fileNameToTitle(str: string) {
  return normalizeWhiteSpace(removeExtension(str).replace(/_/g, ' '));
}

export function replaceAssetDomain(fileUrl: string) {
  const assetDomainMap: Record<string, string> = {
    images: 'images.ctfassets.net',
    assets: 'assets.ctfassets.net',
    downloads: 'downloads.ctfassets.net',
    videos: 'videos.ctfassets.net',
  };

  return fileUrl.replace(/(images|assets|downloads|videos).contentful.com/, (_, p1) => {
    return assetDomainMap[p1];
  });
}

function makeAssetLink(
  asset: Asset,
  { localeCode, fallbackCode, defaultLocaleCode }: Locales
): LinkWithMedia | null {
  const localizedFile = get(asset, ['fields', 'file', localeCode]);
  const fallbackFile = fallbackCode ? get(asset, ['fields', 'file', fallbackCode]) : null;
  const defaultFile = get(asset, ['fields', 'file', defaultLocaleCode]);
  const file:
    | {
        url: string;
        fileName: string;
      }
    | undefined = localizedFile || fallbackFile || defaultFile;

  if (isObject(file) && file.url) {
    const title: string =
      get(asset, ['fields', 'title', localeCode]) ||
      get(asset, ['fields', 'title', fallbackCode || '']) ||
      get(asset, ['fields', 'title', defaultLocaleCode]) ||
      fileNameToTitle(file.fileName);

    const fileUrl = replaceAssetDomain(file.url);

    return {
      title,
      asset,
      url: fileUrl,
      // is normally localized and we should not warn about this file
      isLocalized: Boolean(localizedFile),
      // was fallback value used
      // if it was not localized normally, and we did not used a fallback
      // it means we used a default locale - we filter empty values
      isFallback: Boolean(fallbackFile),
      // todo: tranform using fromHostname
      asMarkdown: `![${title}](${fileUrl})`,
    };
  } else {
    return null;
  }
}

export async function insertAssetLinks(assets: Array<Asset>, locales: Locales) {
  // check whether do we have some assets, which don't have
  // a version in this field's locale
  const otherLocales = assets.filter((asset) => {
    return !get(asset, ['fields', 'file', locales.localeCode]);
  });

  const linksWithMeta = assets
    .map((asset) => makeAssetLink(asset, locales))
    // remove empty links
    .filter((asset) => asset !== null) as LinkWithMedia[];

  // if there have values from fallback/default locales, we need to
  // provide user a warning so we show him modal
  if (otherLocales.length > 0) {
    const fallbackAssets = linksWithMeta
      // we don't want to warn about normally localized files
      .filter(({ isLocalized }) => !isLocalized)
      .map(({ title, isFallback, asset }) => {
        const code = isFallback ? locales.fallbackCode : locales.defaultLocaleCode;
        return {
          title,
          thumbnailUrl: asset.fields.file[code as string].url,
          thumbnailAltText: title,
          description: isFallback ? `Fallback locale (${code})` : `Default locale (${code})`,
          asset: asset,
        };
      });

    return {
      fallbacks: fallbackAssets,
      links: linksWithMeta,
    };
  }
  return {
    links: linksWithMeta,
  };
}
