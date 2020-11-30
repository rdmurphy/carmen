'use strict';

const externalHelpers = require('handlebars-helpers')(['comparison']);

function moveNumberToEnd(str) {
    return str.replace(/^(\d+) ([^\d]+)$/, '$2 $1');
}

module.exports = { ...externalHelpers, moveNumberToEnd };
