import englishDefault from './english_default_locale.json';
import german from './german_locale.json';
const list = {
    sys: {
        type: 'Array'
    },
    total: 2,
    skip: 0,
    limit: 100,
    items: [
        englishDefault,
        german
    ]
};
export { englishDefault, german, list };
