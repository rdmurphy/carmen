'use strict';

const helpers = require('../../../lib/util/helpers');
const tape = require('tape');

tape('test moveNumberToEnd', (t) => {
    t.equals(helpers.moveNumberToEnd('1 main st'), 'main st 1', 'moves number to end');
    t.equals(helpers.moveNumberToEnd('main st'), 'main st', 'string without numbers does nothing');
    t.equals(helpers.moveNumberToEnd('1 17th st'), '1 17th st', 'string with multiple numbers does nothing');
    t.equals(helpers.moveNumberToEnd(undefined), undefined, 'undefined input does nothing');
    t.end();
});
