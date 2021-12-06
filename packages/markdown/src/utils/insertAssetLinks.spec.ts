import { replaceAssetDomain } from './insertAssetLinks';

describe('replaceAssetDomain', () => {
  it('should replace contentful.com domains to ctfassets.net', () => {
    expect(replaceAssetDomain('//images.contentful.com/image.jpg')).toBe(
      '//images.ctfassets.net/image.jpg'
    );
    expect(replaceAssetDomain('//videos.contentful.com/video.mp4')).toBe(
      '//videos.ctfassets.net/video.mp4'
    );
    expect(replaceAssetDomain('//downloads.contentful.com/file.doc')).toBe(
      '//downloads.ctfassets.net/file.doc'
    );
    expect(replaceAssetDomain('//assets.contentful.com/file.doc')).toBe(
      '//assets.ctfassets.net/file.doc'
    );

    expect(replaceAssetDomain('https://images.contentful.com/image.jpg')).toBe(
      'https://images.ctfassets.net/image.jpg'
    );
    expect(replaceAssetDomain('https://videos.contentful.com/video.mp4')).toBe(
      'https://videos.ctfassets.net/video.mp4'
    );
    expect(replaceAssetDomain('https://downloads.contentful.com/file.doc')).toBe(
      'https://downloads.ctfassets.net/file.doc'
    );
    expect(replaceAssetDomain('https://assets.contentful.com/file.doc')).toBe(
      'https://assets.ctfassets.net/file.doc'
    );
  });

  it('should not replace domains not listed on the map', () => {
    expect(replaceAssetDomain('//documents.contentful.com/image.jpg')).toBe(
      '//documents.contentful.com/image.jpg'
    );

    expect(replaceAssetDomain('anyotherdomain.com/file.doc')).toBe('anyotherdomain.com/file.doc');

    expect(replaceAssetDomain('https://anyotherdomain.com/file.doc')).toBe(
      'https://anyotherdomain.com/file.doc'
    );
  });
});
