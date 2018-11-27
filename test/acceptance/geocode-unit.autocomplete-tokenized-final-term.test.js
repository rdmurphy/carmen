// Ensures that we don't autocomplete token-replaced terms to the beginning of other words

'use strict';
const tape = require('tape');
const Carmen = require('../..');
const context = require('../../lib/geocoder/context');
const mem = require('../../lib/sources/api-mem');
const { queueFeature, buildQueued } = require('../../lib/indexer/addfeature');

(() => {
    const conf = {
        poi: new mem({
            maxzoom: 6,
            geocoder_tokens: { 'District': 'Dt' }
        }, () => {}),
    };
    const c = new Carmen(conf);

    tape('index poi', (assert) => {
        queueFeature(conf.poi, {
            id:1,
            properties: {
                'carmen:text': 'DTOWN PARTY BUS',
                'carmen:center': [0,0]
            },
            geometry: {
                type: 'MultiPoint',
                coordinates: [[0,0]]
            }
        }, assert.end);
        queueFeature(conf.poi, {
            id:2,
            properties: {
                'carmen:text': 'District',
                'carmen:center': [1,0]
            },
            geometry: {
                type: 'MultiPoint',
                coordinates: [[1,0]]
            }
        }, assert.end);
        queueFeature(conf.poi, {
            id:3,
            properties: {
                'carmen:text': 'District Taco',
                'carmen:center': [0,1]
            },
            geometry: {
                type: 'MultiPoint',
                coordinates: [[0,1]]
            }
        }, assert.end);

    });

    tape('build', (assert) => { buildQueued(conf.poi, assert.end); });

    tape('Search', (assert) => {
        c.geocode('District', { autocomplete: true }, (err, res) => {
            assert.ifError(err);
            assert.equal(res.features.length, 2, 'Don\'t return features where the token-replaced query is the beginning of another word');
            assert.deepEqual(res.features[0].place_name, 'District', 'Return features that exactly match the token-replaced query');
            assert.deepEqual(res.features[1].place_name, 'District Taco', 'Return features that autocomplete with a word boundary');
            assert.end();
        });
    });
})();


tape('teardown', (t) => {
    context.getTile.cache.reset();
    t.end();
});
