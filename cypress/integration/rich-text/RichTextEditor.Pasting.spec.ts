import { RichTextPage } from './RichTextPage';

// the sticky toolbar gets in the way of some of the tests, therefore
// we increase the viewport height to fit the whole page on the screen
describe(
  'Rich Text Editor',
  {
    viewportHeight: 2000,
    retries: 0,
  },
  () => {
    let richText: RichTextPage;

    beforeEach(() => {
      richText = new RichTextPage();
      richText.visit();
    });

    it('removes style tags', () => {
      richText.editor.click().paste({
        'text/html': `
            <style> p {background: white;}</style>
            <p>paste only this</p>`,
      });

      richText.expectSnapshotValue();
    });

    describe('Lists', () => {
      it('supports pasting of a simple list', () => {
        richText.editor.click().paste({
          'text/html': '<ul><li>item #1</li><li>item #2</li></ul>',
        });

        richText.expectSnapshotValue();
      });

      it('pastes texts inside lists', () => {
        richText.editor.click();
        richText.toolbar.ul.click();

        richText.editor.type('Hello ');

        richText.editor.paste({
          'text/plain': 'world!',
        });

        richText.expectSnapshotValue();
      });

      it('pastes elements inside links', () => {
        richText.editor.click();
        richText.toolbar.ul.click();

        richText.editor.paste({
          'text/html':
            '<meta charset=\'utf-8\'><span data-slate-node="text"><span data-slate-leaf="true"><span data-slate-string="true">This is a </span></span></span><span class="css-1wt9k1k"><a class="css-1dcu81t" data-test-id="cf-ui-text-link" rel="noopener noreferrer" aria-describedby="tooltip_9004" href="https://example.com"><span><span data-slate-node="text"><span data-slate-leaf="true"><span data-slate-string="true">link</span></span></span></span></a></span><span data-slate-node="text"><span data-slate-leaf="true"><span data-slate-string="true"> and an inline entry: </span></span></span><span data-slate-node="element" data-slate-inline="true" data-slate-void="true" class="css-1dx5s2y" data-embedded-entity-inline-id="example-entity-id" data-slate-fragment="JTVCJTdCJTIydHlwZSUyMiUzQSUyMnBhcmFncmFwaCUyMiUyQyUyMmNoaWxkcmVuJTIyJTNBJTVCJTdCJTIydGV4dCUyMiUzQSUyMlRoaXMlMjBpcyUyMGElMjAlMjIlMkMlMjJkYXRhJTIyJTNBJTdCJTdEJTdEJTJDJTdCJTIydHlwZSUyMiUzQSUyMmh5cGVybGluayUyMiUyQyUyMmRhdGElMjIlM0ElN0IlMjJ1cmklMjIlM0ElMjJodHRwcyUzQSUyRiUyRmV4YW1wbGUuY29tJTIyJTdEJTJDJTIyY2hpbGRyZW4lMjIlM0ElNUIlN0IlMjJ0ZXh0JTIyJTNBJTIybGluayUyMiU3RCU1RCU3RCUyQyU3QiUyMnRleHQlMjIlM0ElMjIlMjBhbmQlMjBhbiUyMGlubGluZSUyMGVudHJ5JTNBJTIwJTIyJTdEJTJDJTdCJTIydHlwZSUyMiUzQSUyMmVtYmVkZGVkLWVudHJ5LWlubGluZSUyMiUyQyUyMmNoaWxkcmVuJTIyJTNBJTVCJTdCJTIydGV4dCUyMiUzQSUyMiUyMiU3RCU1RCUyQyUyMmRhdGElMjIlM0ElN0IlMjJ0YXJnZXQlMjIlM0ElN0IlMjJzeXMlMjIlM0ElN0IlMjJpZCUyMiUzQSUyMmV4YW1wbGUtZW50aXR5LWlkJTIyJTJDJTIydHlwZSUyMiUzQSUyMkxpbmslMjIlMkMlMjJsaW5rVHlwZSUyMiUzQSUyMkVudHJ5JTIyJTdEJTdEJTdEJTdEJTJDJTdCJTIydGV4dCUyMiUzQSUyMiUyMiU3RCU1RCUyQyUyMmlzVm9pZCUyMiUzQWZhbHNlJTJDJTIyZGF0YSUyMiUzQSU3QiU3RCU3RCU1RA=="><span contenteditable="false" draggable="true"><article class="css-122osjo" data-test-id="embedded-entry-inline"><div class="css-1sz1u6f" data-card-part="wrapper"><button type="button" aria-label="Actions" aria-haspopup="menu" aria-expanded="false" aria-controls="menu_8727" data-test-id="cf-ui-card-actions" class="css-2ulqgl"><span class="css-k008qs"><svg class="css-1jrff5x" data-test-id="cf-ui-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M0 0h24v24H0z" fill="none"></path><path d="M6 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm12 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-6 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"></path></svg></span></button><div class="css-123a08z" data-card-part="content"><span class="css-1eadhne"><span>Example Content Type The best article ever</span></span></div></div></article></span><span data-slate-spacer="true" style="height: 0px; color: transparent; outline: none; position: absolute;"><span data-slate-node="text"><span data-slate-leaf="true"><span data-slate-zero-width="z" data-slate-length="0"></span></span></span></span></span><span data-slate-node="text"><span data-slate-leaf="true"><span data-slate-zero-width="z" data-slate-length="0"></span></span></span>',
        });

        richText.expectSnapshotValue();
      });

      it('pastes list items as new lists inside lists', () => {
        richText.editor.click();
        richText.toolbar.ul.click();

        richText.editor.type('Hello');

        richText.editor.paste({
          'text/html':
            '<meta charset=\'utf-8\'><ul data-slate-node="element" class="css-a9oioc" data-slate-fragment="JTVCJTdCJTIydHlwZSUyMiUzQSUyMnVub3JkZXJlZC1saXN0JTIyJTJDJTIyY2hpbGRyZW4lMjIlM0ElNUIlN0IlMjJ0eXBlJTIyJTNBJTIybGlzdC1pdGVtJTIyJTJDJTIyY2hpbGRyZW4lMjIlM0ElNUIlN0IlMjJ0eXBlJTIyJTNBJTIycGFyYWdyYXBoJTIyJTJDJTIyY2hpbGRyZW4lMjIlM0ElNUIlN0IlMjJ0ZXh0JTIyJTNBJTIyd29ybGQhJTIyJTJDJTIyYm9sZCUyMiUzQXRydWUlN0QlNUQlN0QlNUQlN0QlNUQlN0QlMkMlN0IlMjJ0eXBlJTIyJTNBJTIycGFyYWdyYXBoJTIyJTJDJTIyY2hpbGRyZW4lMjIlM0ElNUIlN0IlMjJ0ZXh0JTIyJTNBJTIyJTIyJTdEJTVEJTdEJTVE"><li data-slate-node="element" class="css-h3rza2"><div data-slate-node="element" class="css-ss00rg"><span data-slate-node="text"><span data-slate-leaf="true"><strong data-slate-leaf="true" class="css-35ezg3"><span data-slate-string="true">world!</span></strong></span></span></div></li></ul>',
        });

        richText.expectSnapshotValue();
      });

      it('confers the parent list type upon list items pasted within lists', () => {
        richText.editor.click();
        richText.toolbar.ol.click();

        richText.editor.type('Hello');

        richText.editor.paste({
          'text/html':
            '<meta charset=\'utf-8\'><ul data-slate-node="element" class="css-a9oioc" data-slate-fragment="JTVCJTdCJTIydHlwZSUyMiUzQSUyMnVub3JkZXJlZC1saXN0JTIyJTJDJTIyY2hpbGRyZW4lMjIlM0ElNUIlN0IlMjJ0eXBlJTIyJTNBJTIybGlzdC1pdGVtJTIyJTJDJTIyY2hpbGRyZW4lMjIlM0ElNUIlN0IlMjJ0eXBlJTIyJTNBJTIycGFyYWdyYXBoJTIyJTJDJTIyY2hpbGRyZW4lMjIlM0ElNUIlN0IlMjJ0ZXh0JTIyJTNBJTIyd29ybGQhJTIyJTJDJTIyYm9sZCUyMiUzQXRydWUlN0QlNUQlN0QlNUQlN0QlNUQlN0QlMkMlN0IlMjJ0eXBlJTIyJTNBJTIycGFyYWdyYXBoJTIyJTJDJTIyY2hpbGRyZW4lMjIlM0ElNUIlN0IlMjJ0ZXh0JTIyJTNBJTIyJTIyJTdEJTVEJTdEJTVE"><li data-slate-node="element" class="css-h3rza2"><div data-slate-node="element" class="css-ss00rg"><span data-slate-node="text"><span data-slate-leaf="true"><strong data-slate-leaf="true" class="css-35ezg3"><span data-slate-string="true">world!</span></strong></span></span></div></li></ul>',
        });

        richText.expectSnapshotValue();
      });

      it('pastes orphaned list items as unordered lists', () => {
        richText.editor.click();

        richText.editor.paste({
          'text/html':
            '<meta charset=\'utf-8\'><li data-slate-node="element" class="css-h3rza2"><div data-slate-node="element" class="css-ss00rg"><span data-slate-node="text"><span data-slate-leaf="true"><span data-slate-string="true">Hello</span></span></span></div><ul data-slate-node="element" class="css-a9oioc"><li data-slate-node="element" class="css-h3rza2"><div data-slate-node="element" class="css-ss00rg"><span data-slate-node="text"><span data-slate-leaf="true"><strong data-slate-leaf="true" class="css-35ezg3"><span data-slate-string="true">world!</span></strong></span></span></div></li></ul></li><div data-slate-node="element" class="css-ss00rg"><span data-slate-node="text"><span data-slate-leaf="true"><span data-slate-zero-width="n" data-slate-length="0">\n</span></span></span></div>',
        });

        richText.expectSnapshotValue();
      });

      it('pastes only the text content of other blocks', () => {
        richText.editor.click();
        richText.toolbar.ul.click();

        richText.editor.type('Item #1');

        richText.editor.paste({
          'text/html':
            '<meta charset=\'utf-8\'><tr data-slate-node="element" class="css-1uop5es"><th data-slate-node="element" class="css-cg2mfz"><div data-slate-node="element" class="css-ss00rg"><span data-slate-node="text"><span data-slate-leaf="true"><strong data-slate-leaf="true" class="css-35ezg3"><span data-slate-string="true">Header 1</span></strong></span></span></div></th><th data-slate-node="element" class="css-cg2mfz"><button type="button" tabindex="-1" aria-label="Open table menu" aria-haspopup="menu" aria-expanded="false" aria-controls="menu_3199" data-test-id="cf-table-actions-button" class="css-194n435"><span class="css-k008qs"><svg class="css-1jrff5x" data-test-id="cf-ui-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M5.29289 8.29289C5.68342 7.90237 6.31658 7.90237 6.70711 8.29289L12 13.5858L17.2929 8.29289C17.6834 7.90237 18.3166 7.90237 18.7071 8.29289C19.0976 8.68342 19.0976 9.31658 18.7071 9.70711L12.7071 15.7071C12.3166 16.0976 11.6834 16.0976 11.2929 15.7071L5.29289 9.70711C4.90237 9.31658 4.90237 8.68342 5.29289 8.29289Z"></path></svg></span></button><div data-slate-node="element" class="css-ss00rg"><span data-slate-node="text"><span data-slate-leaf="true"><span data-slate-string="true">Header 2 (</span></span></span><span class="css-1wt9k1k"><a class="css-1dcu81t" data-test-id="cf-ui-text-link" rel="noopener noreferrer" aria-describedby="tooltip_5239" href="https://example.com"><span><span data-slate-node="text"><span data-slate-leaf="true"><span data-slate-string="true">with link</span></span></span></span></a></span><span data-slate-node="text"><span data-slate-leaf="true"><span data-slate-string="true">)</span></span></span></div></th></tr><tr data-slate-node="element" class="css-1uop5es" data-slate-fragment="JTVCJTdCJTIydHlwZSUyMiUzQSUyMnRhYmxlJTIyJTJDJTIyY2hpbGRyZW4lMjIlM0ElNUIlN0IlMjJ0eXBlJTIyJTNBJTIydGFibGUtcm93JTIyJTJDJTIyY2hpbGRyZW4lMjIlM0ElNUIlN0IlMjJ0eXBlJTIyJTNBJTIydGFibGUtaGVhZGVyLWNlbGwlMjIlMkMlMjJjaGlsZHJlbiUyMiUzQSU1QiU3QiUyMnR5cGUlMjIlM0ElMjJwYXJhZ3JhcGglMjIlMkMlMjJjaGlsZHJlbiUyMiUzQSU1QiU3QiUyMnRleHQlMjIlM0ElMjJIZWFkZXIlMjAxJTIyJTJDJTIyYm9sZCUyMiUzQXRydWUlN0QlNUQlN0QlNUQlN0QlMkMlN0IlMjJ0eXBlJTIyJTNBJTIydGFibGUtaGVhZGVyLWNlbGwlMjIlMkMlMjJjaGlsZHJlbiUyMiUzQSU1QiU3QiUyMnR5cGUlMjIlM0ElMjJwYXJhZ3JhcGglMjIlMkMlMjJjaGlsZHJlbiUyMiUzQSU1QiU3QiUyMnRleHQlMjIlM0ElMjJIZWFkZXIlMjAyJTIwKCUyMiU3RCUyQyU3QiUyMnR5cGUlMjIlM0ElMjJoeXBlcmxpbmslMjIlMkMlMjJkYXRhJTIyJTNBJTdCJTIydXJpJTIyJTNBJTIyaHR0cHMlM0ElMkYlMkZleGFtcGxlLmNvbSUyMiU3RCUyQyUyMmNoaWxkcmVuJTIyJTNBJTVCJTdCJTIydGV4dCUyMiUzQSUyMndpdGglMjBsaW5rJTIyJTdEJTVEJTdEJTJDJTdCJTIydGV4dCUyMiUzQSUyMiklMjIlN0QlNUQlN0QlNUQlN0QlNUQlN0QlMkMlN0IlMjJ0eXBlJTIyJTNBJTIydGFibGUtcm93JTIyJTJDJTIyY2hpbGRyZW4lMjIlM0ElNUIlN0IlMjJ0eXBlJTIyJTNBJTIydGFibGUtY2VsbCUyMiUyQyUyMmNoaWxkcmVuJTIyJTNBJTVCJTdCJTIydHlwZSUyMiUzQSUyMnBhcmFncmFwaCUyMiUyQyUyMmNoaWxkcmVuJTIyJTNBJTVCJTdCJTIydGV4dCUyMiUzQSUyMkNlbGwlMjAxJTIyJTJDJTIyYm9sZCUyMiUzQXRydWUlN0QlNUQlN0QlNUQlN0QlMkMlN0IlMjJ0eXBlJTIyJTNBJTIydGFibGUtY2VsbCUyMiUyQyUyMmNoaWxkcmVuJTIyJTNBJTVCJTdCJTIydHlwZSUyMiUzQSUyMnBhcmFncmFwaCUyMiUyQyUyMmNoaWxkcmVuJTIyJTNBJTVCJTdCJTIydGV4dCUyMiUzQSUyMkNlbGwlMjAyJTIyJTdEJTVEJTdEJTVEJTdEJTVEJTdEJTVEJTdEJTVE"><td data-slate-node="element" class="css-o8kig5"><button type="button" tabindex="-1" aria-label="Open table menu" aria-haspopup="menu" aria-expanded="false" aria-controls="menu_5758" data-test-id="cf-table-actions-button" class="css-194n435"><span class="css-k008qs"><svg class="css-1jrff5x" data-test-id="cf-ui-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M5.29289 8.29289C5.68342 7.90237 6.31658 7.90237 6.70711 8.29289L12 13.5858L17.2929 8.29289C17.6834 7.90237 18.3166 7.90237 18.7071 8.29289C19.0976 8.68342 19.0976 9.31658 18.7071 9.70711L12.7071 15.7071C12.3166 16.0976 11.6834 16.0976 11.2929 15.7071L5.29289 9.70711C4.90237 9.31658 4.90237 8.68342 5.29289 8.29289Z"></path></svg></span></button><div data-slate-node="element" class="css-ss00rg"><span data-slate-node="text"><span data-slate-leaf="true"><strong data-slate-leaf="true" class="css-35ezg3"><span data-slate-string="true">Cell 1</span></strong></span></span></div></td><td data-slate-node="element" class="css-o8kig5"><button type="button" tabindex="-1" aria-label="Open table menu" aria-haspopup="menu" aria-expanded="false" aria-controls="menu_4160" data-test-id="cf-table-actions-button" class="css-194n435"><span class="css-k008qs"><svg class="css-1jrff5x" data-test-id="cf-ui-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M5.29289 8.29289C5.68342 7.90237 6.31658 7.90237 6.70711 8.29289L12 13.5858L17.2929 8.29289C17.6834 7.90237 18.3166 7.90237 18.7071 8.29289C19.0976 8.68342 19.0976 9.31658 18.7071 9.70711L12.7071 15.7071C12.3166 16.0976 11.6834 16.0976 11.2929 15.7071L5.29289 9.70711C4.90237 9.31658 4.90237 8.68342 5.29289 8.29289Z"></path></svg></span></button><div data-slate-node="element" class="css-ss00rg"><span data-slate-node="text"><span data-slate-leaf="true"><span data-slate-string="true">Cell 2</span></span></span></div></td></tr>',
        });

        richText.expectSnapshotValue();
      });

      it('pastes table & its inline elements correctly', () => {
        richText.editor.click();

        // What can I do with tables
        // __________________________________________________________________________________
        // | Property                             | Supported                               |
        // |--------------------------------------|-----------------------------------------|
        // | Adding and removing rows and columns | Yes                                     |
        // | Table header                         | Yes, for rows and columns               |
        // | Formatting options                   | Bold,italics,underline,code             |
        // | Hyperlinks                           | URL, asset and entry                    |
        // | Embed entries                        | Only inline entries [inline entry]      |
        // | Copy & paste from other documents    | Yes, Eg. Google Docs, Jira, Confluence  |
        //  --------------------------------------|-----------------------------------------
        //  <empty paragraph>
        //
        richText.editor.paste({
          'application/x-slate-fragment':
            'JTVCJTdCJTIydHlwZSUyMiUzQSUyMnBhcmFncmFwaCUyMiUyQyUyMmNoaWxkcmVuJTIyJTNBJTVCJTdCJTIydGV4dCUyMiUzQSUyMldoYXQlMjBjYW4lMjBJJTIwZG8lMjB3aXRoJTIwdGFibGVzJTIyJTJDJTIyZGF0YSUyMiUzQSU3QiU3RCU3RCU1RCUyQyUyMmlzVm9pZCUyMiUzQWZhbHNlJTJDJTIyZGF0YSUyMiUzQSU3QiU3RCU3RCUyQyU3QiUyMnR5cGUlMjIlM0ElMjJ0YWJsZSUyMiUyQyUyMmNoaWxkcmVuJTIyJTNBJTVCJTdCJTIydHlwZSUyMiUzQSUyMnRhYmxlLXJvdyUyMiUyQyUyMmNoaWxkcmVuJTIyJTNBJTVCJTdCJTIydHlwZSUyMiUzQSUyMnRhYmxlLWhlYWRlci1jZWxsJTIyJTJDJTIyY2hpbGRyZW4lMjIlM0ElNUIlN0IlMjJ0eXBlJTIyJTNBJTIycGFyYWdyYXBoJTIyJTJDJTIyY2hpbGRyZW4lMjIlM0ElNUIlN0IlMjJ0ZXh0JTIyJTNBJTIyUHJvcGVydHklMjIlN0QlNUQlN0QlNUQlN0QlMkMlN0IlMjJ0eXBlJTIyJTNBJTIydGFibGUtaGVhZGVyLWNlbGwlMjIlMkMlMjJjaGlsZHJlbiUyMiUzQSU1QiU3QiUyMnR5cGUlMjIlM0ElMjJwYXJhZ3JhcGglMjIlMkMlMjJjaGlsZHJlbiUyMiUzQSU1QiU3QiUyMnRleHQlMjIlM0ElMjJTdXBwb3J0ZWQlMjIlN0QlNUQlN0QlNUQlN0QlNUQlN0QlMkMlN0IlMjJ0eXBlJTIyJTNBJTIydGFibGUtcm93JTIyJTJDJTIyY2hpbGRyZW4lMjIlM0ElNUIlN0IlMjJ0eXBlJTIyJTNBJTIydGFibGUtY2VsbCUyMiUyQyUyMmNoaWxkcmVuJTIyJTNBJTVCJTdCJTIydHlwZSUyMiUzQSUyMnBhcmFncmFwaCUyMiUyQyUyMmNoaWxkcmVuJTIyJTNBJTVCJTdCJTIydGV4dCUyMiUzQSUyMkFkZGluZyUyMGFuZCUyMHJlbW92aW5nJTIwcm93cyUyMGFuZCUyMGNvbHVtbnMlMjIlN0QlNUQlN0QlNUQlN0QlMkMlN0IlMjJ0eXBlJTIyJTNBJTIydGFibGUtY2VsbCUyMiUyQyUyMmNoaWxkcmVuJTIyJTNBJTVCJTdCJTIydHlwZSUyMiUzQSUyMnBhcmFncmFwaCUyMiUyQyUyMmNoaWxkcmVuJTIyJTNBJTVCJTdCJTIydGV4dCUyMiUzQSUyMlllcyUyMiU3RCU1RCU3RCU1RCU3RCU1RCU3RCUyQyU3QiUyMnR5cGUlMjIlM0ElMjJ0YWJsZS1yb3clMjIlMkMlMjJjaGlsZHJlbiUyMiUzQSU1QiU3QiUyMnR5cGUlMjIlM0ElMjJ0YWJsZS1jZWxsJTIyJTJDJTIyY2hpbGRyZW4lMjIlM0ElNUIlN0IlMjJ0eXBlJTIyJTNBJTIycGFyYWdyYXBoJTIyJTJDJTIyY2hpbGRyZW4lMjIlM0ElNUIlN0IlMjJ0ZXh0JTIyJTNBJTIyVGFibGUlMjBoZWFkZXIlMjIlN0QlNUQlN0QlNUQlN0QlMkMlN0IlMjJ0eXBlJTIyJTNBJTIydGFibGUtY2VsbCUyMiUyQyUyMmNoaWxkcmVuJTIyJTNBJTVCJTdCJTIydHlwZSUyMiUzQSUyMnBhcmFncmFwaCUyMiUyQyUyMmNoaWxkcmVuJTIyJTNBJTVCJTdCJTIydGV4dCUyMiUzQSUyMlllcyUyQyUyMGZvciUyMHJvd3MlMjBhbmQlMjBjb2x1bW5zJTIyJTdEJTVEJTdEJTVEJTdEJTVEJTdEJTJDJTdCJTIydHlwZSUyMiUzQSUyMnRhYmxlLXJvdyUyMiUyQyUyMmNoaWxkcmVuJTIyJTNBJTVCJTdCJTIydHlwZSUyMiUzQSUyMnRhYmxlLWNlbGwlMjIlMkMlMjJjaGlsZHJlbiUyMiUzQSU1QiU3QiUyMnR5cGUlMjIlM0ElMjJwYXJhZ3JhcGglMjIlMkMlMjJjaGlsZHJlbiUyMiUzQSU1QiU3QiUyMnRleHQlMjIlM0ElMjJGb3JtYXR0aW5nJTIwb3B0aW9ucyUyMiU3RCU1RCU3RCU1RCU3RCUyQyU3QiUyMnR5cGUlMjIlM0ElMjJ0YWJsZS1jZWxsJTIyJTJDJTIyY2hpbGRyZW4lMjIlM0ElNUIlN0IlMjJ0eXBlJTIyJTNBJTIycGFyYWdyYXBoJTIyJTJDJTIyY2hpbGRyZW4lMjIlM0ElNUIlN0IlMjJ0ZXh0JTIyJTNBJTIyQm9sZCUyMiUyQyUyMmJvbGQlMjIlM0F0cnVlJTdEJTJDJTdCJTIydGV4dCUyMiUzQSUyMiUyQyUyMiU3RCUyQyU3QiUyMnRleHQlMjIlM0ElMjJpdGFsaWNzJTIyJTJDJTIyaXRhbGljJTIyJTNBdHJ1ZSU3RCUyQyU3QiUyMnRleHQlMjIlM0ElMjIlMkMlMjIlN0QlMkMlN0IlMjJ0ZXh0JTIyJTNBJTIydW5kZXJsaW5lJTIyJTJDJTIydW5kZXJsaW5lJTIyJTNBdHJ1ZSU3RCUyQyU3QiUyMnRleHQlMjIlM0ElMjIlMkMlMjIlN0QlMkMlN0IlMjJ0ZXh0JTIyJTNBJTIyY29kZSUyMiUyQyUyMmNvZGUlMjIlM0F0cnVlJTdEJTVEJTdEJTVEJTdEJTVEJTdEJTJDJTdCJTIydHlwZSUyMiUzQSUyMnRhYmxlLXJvdyUyMiUyQyUyMmNoaWxkcmVuJTIyJTNBJTVCJTdCJTIydHlwZSUyMiUzQSUyMnRhYmxlLWNlbGwlMjIlMkMlMjJjaGlsZHJlbiUyMiUzQSU1QiU3QiUyMnR5cGUlMjIlM0ElMjJwYXJhZ3JhcGglMjIlMkMlMjJjaGlsZHJlbiUyMiUzQSU1QiU3QiUyMnRleHQlMjIlM0ElMjJIeXBlcmxpbmtzJTIyJTdEJTVEJTdEJTVEJTdEJTJDJTdCJTIydHlwZSUyMiUzQSUyMnRhYmxlLWNlbGwlMjIlMkMlMjJjaGlsZHJlbiUyMiUzQSU1QiU3QiUyMnR5cGUlMjIlM0ElMjJwYXJhZ3JhcGglMjIlMkMlMjJjaGlsZHJlbiUyMiUzQSU1QiU3QiUyMnRleHQlMjIlM0ElMjIlMjIlN0QlMkMlN0IlMjJ0eXBlJTIyJTNBJTIyaHlwZXJsaW5rJTIyJTJDJTIyZGF0YSUyMiUzQSU3QiUyMnVyaSUyMiUzQSUyMmh0dHBzJTNBJTJGJTJGZ29vZ2xlLmNvbSUyMiU3RCUyQyUyMmNoaWxkcmVuJTIyJTNBJTVCJTdCJTIydGV4dCUyMiUzQSUyMlVSTCUyMiU3RCU1RCU3RCUyQyU3QiUyMnRleHQlMjIlM0ElMjIlMkMlMjAlMjIlN0QlMkMlN0IlMjJ0eXBlJTIyJTNBJTIyYXNzZXQtaHlwZXJsaW5rJTIyJTJDJTIyZGF0YSUyMiUzQSU3QiUyMnRhcmdldCUyMiUzQSU3QiUyMnN5cyUyMiUzQSU3QiUyMmlkJTIyJTNBJTIyZXhhbXBsZS1lbnRpdHktaWQlMjIlMkMlMjJ0eXBlJTIyJTNBJTIyTGluayUyMiUyQyUyMmxpbmtUeXBlJTIyJTNBJTIyQXNzZXQlMjIlN0QlN0QlN0QlMkMlMjJjaGlsZHJlbiUyMiUzQSU1QiU3QiUyMnRleHQlMjIlM0ElMjJhc3NldCUyMiU3RCU1RCU3RCUyQyU3QiUyMnRleHQlMjIlM0ElMjIlMjBhbmQlMjAlMjIlN0QlMkMlN0IlMjJ0eXBlJTIyJTNBJTIyZW50cnktaHlwZXJsaW5rJTIyJTJDJTIyZGF0YSUyMiUzQSU3QiUyMnRhcmdldCUyMiUzQSU3QiUyMnN5cyUyMiUzQSU3QiUyMmlkJTIyJTNBJTIyZXhhbXBsZS1lbnRpdHktaWQlMjIlMkMlMjJ0eXBlJTIyJTNBJTIyTGluayUyMiUyQyUyMmxpbmtUeXBlJTIyJTNBJTIyRW50cnklMjIlN0QlN0QlN0QlMkMlMjJjaGlsZHJlbiUyMiUzQSU1QiU3QiUyMnRleHQlMjIlM0ElMjJlbnRyeSUyMiU3RCU1RCU3RCUyQyU3QiUyMnRleHQlMjIlM0ElMjIlMjIlN0QlNUQlN0QlNUQlN0QlNUQlN0QlMkMlN0IlMjJ0eXBlJTIyJTNBJTIydGFibGUtcm93JTIyJTJDJTIyY2hpbGRyZW4lMjIlM0ElNUIlN0IlMjJ0eXBlJTIyJTNBJTIydGFibGUtY2VsbCUyMiUyQyUyMmNoaWxkcmVuJTIyJTNBJTVCJTdCJTIydHlwZSUyMiUzQSUyMnBhcmFncmFwaCUyMiUyQyUyMmNoaWxkcmVuJTIyJTNBJTVCJTdCJTIydGV4dCUyMiUzQSUyMkVtYmVkJTIwZW50cmllcyUyMiU3RCU1RCU3RCU1RCU3RCUyQyU3QiUyMnR5cGUlMjIlM0ElMjJ0YWJsZS1jZWxsJTIyJTJDJTIyY2hpbGRyZW4lMjIlM0ElNUIlN0IlMjJ0eXBlJTIyJTNBJTIycGFyYWdyYXBoJTIyJTJDJTIyY2hpbGRyZW4lMjIlM0ElNUIlN0IlMjJ0ZXh0JTIyJTNBJTIyT25seSUyMGlubGluZSUyMGVudHJpZXMlMjAlMjIlN0QlMkMlN0IlMjJ0eXBlJTIyJTNBJTIyZW1iZWRkZWQtZW50cnktaW5saW5lJTIyJTJDJTIyY2hpbGRyZW4lMjIlM0ElNUIlN0IlMjJ0ZXh0JTIyJTNBJTIyJTIyJTdEJTVEJTJDJTIyZGF0YSUyMiUzQSU3QiUyMnRhcmdldCUyMiUzQSU3QiUyMnN5cyUyMiUzQSU3QiUyMmlkJTIyJTNBJTIyZXhhbXBsZS1lbnRpdHktaWQlMjIlMkMlMjJ0eXBlJTIyJTNBJTIyTGluayUyMiUyQyUyMmxpbmtUeXBlJTIyJTNBJTIyRW50cnklMjIlN0QlN0QlN0QlN0QlMkMlN0IlMjJ0ZXh0JTIyJTNBJTIyJTIyJTdEJTVEJTdEJTVEJTdEJTVEJTdEJTJDJTdCJTIydHlwZSUyMiUzQSUyMnRhYmxlLXJvdyUyMiUyQyUyMmNoaWxkcmVuJTIyJTNBJTVCJTdCJTIydHlwZSUyMiUzQSUyMnRhYmxlLWNlbGwlMjIlMkMlMjJjaGlsZHJlbiUyMiUzQSU1QiU3QiUyMnR5cGUlMjIlM0ElMjJwYXJhZ3JhcGglMjIlMkMlMjJjaGlsZHJlbiUyMiUzQSU1QiU3QiUyMnRleHQlMjIlM0ElMjJDb3B5JTIwJTI2JTIwcGFzdGUlMjBmcm9tJTIwb3RoZXIlMjBkb2N1bWVudHMlMjIlN0QlNUQlN0QlNUQlN0QlMkMlN0IlMjJ0eXBlJTIyJTNBJTIydGFibGUtY2VsbCUyMiUyQyUyMmNoaWxkcmVuJTIyJTNBJTVCJTdCJTIydHlwZSUyMiUzQSUyMnBhcmFncmFwaCUyMiUyQyUyMmNoaWxkcmVuJTIyJTNBJTVCJTdCJTIydGV4dCUyMiUzQSUyMlllcy4lMjBFZy4lMjBHb29nbGUlMjBEb2NzJTJDJTIwSmlyYSUyQyUyMENvbmZsdWVuY2UlMjIlN0QlNUQlN0QlNUQlN0QlNUQlN0QlNUQlN0QlMkMlN0IlMjJ0eXBlJTIyJTNBJTIycGFyYWdyYXBoJTIyJTJDJTIyY2hpbGRyZW4lMjIlM0ElNUIlN0IlMjJ0ZXh0JTIyJTNBJTIyJTIyJTdEJTVEJTdEJTVE',
        });

        richText.expectSnapshotValue();
      });
    });

    describe('HR', () => {
      it('should paste from internal copying', () => {
        richText.editor.click().paste({
          'text/html': `<div data-void-element="hr"></div>`,
        });

        richText.expectSnapshotValue();
      });

      it('should paste from external resources', () => {
        richText.editor.click().paste({
          'text/html': `<div><hr /></div>`,
        });

        richText.expectSnapshotValue();
      });
    });

    describe('spreadsheets', () => {
      describe('removes empty columns/rows', () => {
        it('Google Sheets', () => {
          richText.editor.click().paste({
            'text/html':
              '<google-sheets-html-origin><style type="text/css"><!--td {border: 1px solid #ccc;}br {mso-data-placement:same-cell;}--></style><table xmlns="http://www.w3.org/1999/xhtml" cellspacing="0" cellpadding="0" dir="ltr" border="1" style="table-layout:fixed;font-size:10pt;font-family:Arial;width:0px;border-collapse:collapse;border:none"><colgroup><col width="100"/><col width="100"/><col width="100"/><col width="100"/><col width="100"/><col width="100"/></colgroup><tbody><tr style="height:21px;"><td style="overflow:hidden;padding:2px 3px 2px 3px;vertical-align:bottom;" data-sheets-value="{&quot;1&quot;:2,&quot;2&quot;:&quot;Cell 1&quot;}">Cell 1</td><td style="overflow:hidden;padding:2px 3px 2px 3px;vertical-align:bottom;"></td><td style="overflow:hidden;padding:2px 3px 2px 3px;vertical-align:bottom;" data-sheets-value="{&quot;1&quot;:2,&quot;2&quot;:&quot;Cell 2&quot;}">Cell 2</td><td style="overflow:hidden;padding:2px 3px 2px 3px;vertical-align:bottom;"></td><td style="overflow:hidden;padding:2px 3px 2px 3px;vertical-align:bottom;"></td><td style="overflow:hidden;padding:2px 3px 2px 3px;vertical-align:bottom;"></td></tr><tr style="height:21px;"><td style="overflow:hidden;padding:2px 3px 2px 3px;vertical-align:bottom;"></td><td style="overflow:hidden;padding:2px 3px 2px 3px;vertical-align:bottom;"></td><td style="overflow:hidden;padding:2px 3px 2px 3px;vertical-align:bottom;"></td><td style="overflow:hidden;padding:2px 3px 2px 3px;vertical-align:bottom;"></td><td style="overflow:hidden;padding:2px 3px 2px 3px;vertical-align:bottom;"></td><td style="overflow:hidden;padding:2px 3px 2px 3px;vertical-align:bottom;"></td></tr><tr style="height:21px;"><td style="overflow:hidden;padding:2px 3px 2px 3px;vertical-align:bottom;"></td><td style="overflow:hidden;padding:2px 3px 2px 3px;vertical-align:bottom;"></td><td style="overflow:hidden;padding:2px 3px 2px 3px;vertical-align:bottom;"></td><td style="overflow:hidden;padding:2px 3px 2px 3px;vertical-align:bottom;"></td><td style="overflow:hidden;padding:2px 3px 2px 3px;vertical-align:bottom;"></td><td style="overflow:hidden;padding:2px 3px 2px 3px;vertical-align:bottom;"></td></tr><tr style="height:21px;"><td style="overflow:hidden;padding:2px 3px 2px 3px;vertical-align:bottom;"></td><td style="overflow:hidden;padding:2px 3px 2px 3px;vertical-align:bottom;"></td><td style="overflow:hidden;padding:2px 3px 2px 3px;vertical-align:bottom;"></td><td style="overflow:hidden;padding:2px 3px 2px 3px;vertical-align:bottom;"></td><td style="overflow:hidden;padding:2px 3px 2px 3px;vertical-align:bottom;"></td><td style="overflow:hidden;padding:2px 3px 2px 3px;vertical-align:bottom;"></td></tr></tbody></table>',
          });

          richText.expectSnapshotValue();
        });

        it('MS Excel', () => {
          richText.editor.click().paste({
            'text/html':
              "<div ccp_infra_version='3' ccp_infra_timestamp='1641327998326' ccp_infra_user_hash='4114474985' ccp_infra_copy_id='' data-ccp-timestamp='1641327998326'><html>\r\n\r\n<head>\r\n<meta http-equiv=Content-Type content=\"text/html; charset=utf-8\">\r\n<meta name=ProgId content=Excel.Sheet>\r\n<meta name=Generator content=\"Microsoft Excel 15\">\r\n<style>\r\ntable\r\n\t{mso-displayed-decimal-separator:\"\\,\";\r\n\tmso-displayed-thousand-separator:\"\\.\";}\r\ntr\r\n\t{mso-height-source:auto;}\r\ncol\r\n\t{mso-width-source:auto;}\r\ntd\r\n\t{padding-top:1px;\r\n\tpadding-right:1px;\r\n\tpadding-left:1px;\r\n\tmso-ignore:padding;\r\n\tcolor:black;\r\n\tfont-size:11.0pt;\r\n\tfont-weight:400;\r\n\tfont-style:normal;\r\n\ttext-decoration:none;\r\n\tfont-family:Calibri, sans-serif;\r\n\tmso-font-charset:0;\r\n\ttext-align:general;\r\n\tvertical-align:bottom;\r\n\tborder:none;\r\n\twhite-space:nowrap;\r\n\tmso-rotate:0;}\r\n</style>\r\n</head>\r\n\r\n<body link=\"#0563C1\" vlink=\"#954F72\">\r\n\r\n<table width=384 style='border-collapse:collapse;width:288pt'>\r\n<!--StartFragment-->\r\n <col width=64 style='width:48pt' span=6>\r\n <tr height=20 style='height:15.0pt'>\r\n  <td width=64 height=20 style='width:48pt;height:15.0pt'>Cell 1</td>\r\n  <td width=64 style='width:48pt'></td>\r\n  <td width=64 style='width:48pt'>Cell 2</td>\r\n  <td width=64 style='width:48pt'></td>\r\n  <td width=64 style='width:48pt'></td>\r\n  <td width=64 style='width:48pt'></td>\r\n </tr>\r\n <tr height=20 style='height:15.0pt'>\r\n  <td height=20 style='height:15.0pt'></td>\r\n  <td></td>\r\n  <td></td>\r\n  <td></td>\r\n  <td></td>\r\n  <td></td>\r\n </tr>\r\n <tr height=20 style='height:15.0pt'>\r\n  <td height=20 style='height:15.0pt'></td>\r\n  <td></td>\r\n  <td></td>\r\n  <td></td>\r\n  <td></td>\r\n  <td></td>\r\n </tr>\r\n <tr height=20 style='height:15.0pt'>\r\n  <td height=20 style='height:15.0pt'></td>\r\n  <td></td>\r\n  <td></td>\r\n  <td></td>\r\n  <td></td>\r\n  <td></td>\r\n </tr>\r\n<!--EndFragment-->\r\n</table>\r\n\r\n</body>\r\n\r\n</html>\r\n</div>",
          });

          richText.expectSnapshotValue();
        });
      });
    });
  }
);
