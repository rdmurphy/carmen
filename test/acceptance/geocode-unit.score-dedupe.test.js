'use strict';

const tape = require('tape');
const Carmen = require('../..');
const context = require('../../lib/geocoder/context');
const mem = require('../../lib/sources/api-mem');
const queue = require('d3-queue').queue;
const { queueFeature, buildQueued } = require('../../lib/indexer/addfeature');

const conf = {
    place: new mem({ maxzoom: 6 }, () => {})
};
const c = new Carmen(conf);
tape('index data', (t) => {
    const q = queue(1);
    q.defer((cb) => queueFeature(
        conf.place,
        {
            id: 1,
            properties: {
                'carmen:text': 'fake place 1',
                'carmen:center': [0,0],
                'carmen:score': -1
            },
            geometry: {
                type: 'Point',
                coordinates: [0,0]
            }
        },
        cb
    ));
    q.defer((cb) => queueFeature(
        conf.place,
        {
            id: 2,
            properties: {
                'carmen:text': 'fake place 1',
                'carmen:center': [0,1],
                'carmen:score': 1
            },
            geometry: {
                type: 'Point',
                coordinates: [0,1]
            }
        },
        cb
    ));

    q.defer((cb) => buildQueued(conf.place, cb));

    q.awaitAll(t.end);
});

tape('test deduping features with identical text preserving the feature with a higher score', (t) => {
    c.geocode('fake place 1', { limit_verify: 5 }, (err, res) => {
        t.equals(res.features.length, 1, 'returned the feature with higher score');
        t.equals(res.features[0].id, 'place.2', 'returned fake place 1 with id = place.2');
        t.equals(res.features[0].place_name, 'fake place 1', 'returned fake place 1 feature with a higher score');
        t.ifError(err);
        t.end();
    });
});

tape('teardown', (t) => {
    context.getTile.cache.reset();
    t.end();
});
