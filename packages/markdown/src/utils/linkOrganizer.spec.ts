import * as LinkOrganizer from './linkOrganizer';

describe('Link organizer', () => {
  describe('Inline link finder', () => {
    it('Finds all inline links in text', () => {
      const subject =
        'test [link](http://url.com) test [link2](http://url2.com) test [link3](http://url.com)';
      const found = LinkOrganizer.findInline(subject);
      expect(found).toHaveLength(3);
      expect(found[0].match).toBe('[link](http://url.com)');
      expect(found[0].text).toBe('link');
      expect(found[0].href).toBe('http://url.com');
      expect(found[0].title).toBe('');
    });

    it('Finds and standardizes title', () => {
      const subject = 'test [x](http://url.com   "title!") [y](http://xyz.com title 2   )';
      const found = LinkOrganizer.findInline(subject);
      expect(found).toHaveLength(2);
      expect(found[0].title).toBe('title!');
      expect(found[1].title).toBe('title 2');
    });
  });

  describe('Reference finder', () => {
    it('Finds all references in text', () => {
      const subject = 'test [x][1] test [y][2] [with space separator] [3]';
      const found = LinkOrganizer.findRefs(subject);
      expect(found).toHaveLength(3);
      expect(found[0].match).toBe('[x][1]');
      expect(found[2].match).toBe('[with space separator] [3]');
      expect(found[1].text).toBe('y');
      expect(found[1].id).toBe('2');
    });
  });

  describe('Label finder', () => {
    const subject = [
      '[1]:  http://test.com',
      '[2]: http://url.com',
      '[string]: http://url.com',
      '[4]: http://test.com  "Hello world"',
    ].join('\n');

    it('Finds all labels', () => {
      const found = LinkOrganizer.findLabels(subject);
      expect(found).toHaveLength(4);
      expect(found[0].id).toBe('1');
      expect(found[2].id).toBe('string');
      expect(found[0].href).toBe('http://test.com');
      expect(found[3].href).toBe('http://test.com');
      expect(found[1].title).toBe('');
      expect(found[3].title).toBe('Hello world');
    });

    it('Finds max label id', () => {
      expect(LinkOrganizer.findMaxLabelId(subject)).toBe(4);
    });
  });
});
