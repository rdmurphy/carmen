'use strict';

const tape = require('tape');
const Carmen = require('../..');
const context = require('../../lib/geocoder/context');
const mem = require('../../lib/sources/api-mem');
const queue = require('d3-queue').queue;
const { queueFeature, buildQueued } = require('../../lib/indexer/addfeature');

const conf = {
    country: new mem({ maxzoom: 6 }, () => {}),
    place: new mem({ maxzoom: 6 }, () => {}),
    address: new mem({ maxzoom: 6 }, () => {})
};
const c = new Carmen(conf);
tape('index data', (t) => {
    const q = queue(1);
    q.defer((cb) => queueFeature(
        conf.country,
        {
            id: 1,
            properties: {
                'carmen:text': 'america',
                'carmen:center': [0,0]
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
            id: 3,
            properties: {
                'carmen:text': 'some place',
                'carmen:center': [0,0],
                'carmen:reverse_only': true
            },
            geometry: {
                type: 'Point',
                coordinates: [0,0]
            }
        },
        cb
    ));
    q.defer((cb) => queueFeature(
        conf.address,
        {
            id: 1,
            properties: {
                'carmen:text': 'fake street',
                'carmen:center': [0,0]
            },
            geometry: {
                type: 'MultiPoint',
                coordinates: [[0,0],[0,0],[0,0]]
            }
        },
        cb
    ));
    q.defer((cb) => buildQueued(conf.address, cb));
    q.defer((cb) => buildQueued(conf.place, cb));
    q.defer((cb) => buildQueued(conf.country, cb));

    q.awaitAll(t.end);
});

tape('test [\'carmen:reverse_only\']', (t) => {
    c.geocode('some place', { limit_verify: 1 }, (err, res) => {
        t.equals(res.features.length, 0, 'does not return a feature with property carmen:forward_geocode_override');
        t.ifError(err);
        t.end();
    });
});

tape('test [\'carmen:reverse_only\'] for a feature with the same carmen:text', (t) => {
    c.geocode('some place, america', { limit_verify: 1 }, (err, res) => {
        t.equals(res.features[0].place_name, 'america', 'does not return top level some place');
        t.equals(res.features[0].id, 'country.1', 'returned country');
        t.ifError(err);
        t.end();
    });
});
tape('test [\'carmen:reverse_only\'] for a feature with the same carmen:text', (t) => {
    c.geocode('fake street, some place', { limit_verify: 5 }, (err, res) => {
        t.equals(res.features[0].place_name, 'fake street, some place, america', 'returned some place as a part of the context');
        t.equals(res.features[0].id, 'address.1', 'returned some place as a part of the context');
        t.ifError(err);
        t.end();
    });
});

tape('teardown', (t) => {
    context.getTile.cache.reset();
    t.end();
});
