'use strict';
const tape = require('tape');
const whitespace = require('../../../lib/util/whitespace.js');

tape('numbersPlusLetters', (t) => {
    const numbersPlusLetters = whitespace.correctors.filter((f) => f.name === 'numbersPlusLetters').pop();

    // note that they're still one token for now -- they'll get normalized later when we'll also fix the mask
    t.deepEqual(numbersPlusLetters({ tokens: ['100main', 'st', 'washington'] }), { tokens: ['100 main', 'st', 'washington'] }, 'added space between 100 and main');
    t.deepEqual(numbersPlusLetters({ tokens: ['Rue', 'Gallait76'] }), { tokens: ['Rue', 'Gallait 76'] }, 'added space between 100 and main');

    t.equal(numbersPlusLetters({ tokens: ['one', 'two', 'three'] }), false, 'won\'t change all-letter tokens');
    t.equal(numbersPlusLetters({ tokens: ['21st', 'st'] }), false, 'won\'t split up ordinals -- too few letters');
    t.equal(numbersPlusLetters({ tokens: ['100', 'mainst'] }), false, 'won\'t alter non-numeric whitespace errors');

    t.end();
});
