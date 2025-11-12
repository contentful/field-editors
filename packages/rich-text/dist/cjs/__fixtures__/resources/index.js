"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "published", {
    enumerable: true,
    get: function() {
        return published;
    }
});
const _entry = require("../entry");
const _space = require("../space");
const published = {
    sys: {
        urn: `crn:contentful:::content:spaces/${_space.indifferent.sys.id}/entries/${_entry.published.sys.id}`,
        type: 'ResourceLink',
        linkType: 'Contentful:Entry'
    }
};
