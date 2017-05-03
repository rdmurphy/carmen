var termops = require('../lib/util/termops');
var test = require('tape');

test('terms - tokenizes and hashes values', function(t) {
    t.deepEqual(termops.terms(['foo','bar']), [ 'foo', 'bar' ]);
    t.end();
});

