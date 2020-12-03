'use strict';

const externalHelpers = require('handlebars-helpers')(['comparison']);

function moveNumberToEnd(str) {
    if (str && str.replace) {
        return str.replace(/^(\d+) ([^\d]+)$/, '$2 $1');
    }
    return str;
}

module.exports = { ...externalHelpers, moveNumberToEnd };
