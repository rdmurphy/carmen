'use strict';
const tape = require('tape');
const Carmen = require('../..');
const context = require('../../lib/geocoder/context');
const mem = require('../../lib/sources/api-mem');
const queue = require('d3-queue').queue;
const { queueFeature, buildQueued } = require('../../lib/indexer/addfeature');

// Tests New York (place), New York (region), USA (country)
// identically-named features should reverse the gappy penalty and
// instead prioritize the highest-index feature
const conf = {
    country: new mem({ maxzoom: 6, geocoder_languages: ['en'] }, () => {}),
    region: new mem({ maxzoom: 6, geocoder_languages: ['en'] }, () => {}),
    place: new mem({ maxzoom: 6, geocoder_languages: ['en'], geocoder_inherit_score: true }, () => {}),
    address: new mem({ maxzoom: 14, geocoder_languages: ['en'], geocoder_address: 1 }, () => {})
};

const c = new Carmen(conf);

tape('index country', (t) => {
    queueFeature(conf.country, {
        id: 1,
        properties: {
            'carmen:center': [0,0],
            'carmen:score': 1000000,
            'carmen:text':'usa',
            'carmen:text_en':'usa'
        },
        geometry: {
            type: 'Polygon',
            coordinates: [[
                [-20,-20],
                [-20,20],
                [20,20],
                [20,-20],
                [-20,-20],
            ]]
        }
    }, t.end);
});

tape('index country', (t) => {
    queueFeature(conf.country, {
        id: 2,
        properties: {
            'carmen:center': [45,45],
            'carmen:score': 10,
            'carmen:text':'georgia'
        },
        geometry: {
            type: 'Polygon',
            coordinates: [[
                [40,40],
                [40,50],
                [50,50],
                [50,40],
                [40,40],
            ]]
        }
    }, t.end);
});

tape('index region', (t) => {
    queueFeature(conf.region, {
        id: 1,
        properties: {
            'carmen:center': [0,0],
            'carmen:score': 50,
            'carmen:text':'georgia'
        },
        geometry: {
            type: 'Polygon',
            coordinates: [[
                [-20,-20],
                [-20,20],
                [20,20],
                [20,-20],
                [-20,-20],
            ]]
        }
    }, t.end);
});

tape('index place', (t) => {
    queueFeature(conf.place, {
        id: 1,
        properties: {
            'carmen:center': [45,45],
            'carmen:score': 1,
            'carmen:text':'georgia'
        },
        geometry: {
            type: 'Polygon',
            coordinates: [[
                [42,42],
                [42,48],
                [48,48],
                [48,42],
                [42,42],
            ]]
        }
    }, t.end);
});

tape('index addresses', (t) => {
    const q = queue();
    // this one is inside the region
    q.defer((cb) => queueFeature(conf.address, {
        id: 10,
        type: 'Feature',
        properties: {
            'carmen:addressnumber': ['1'],
            'carmen:text': 'Main St',
            'carmen:center': [0, 0]
        },
        geometry :{
            type: 'MultiPoint',
            coordinates: [[0, 0]]
        }
    }, cb));
    // this one is inside the squishy feature
    q.defer((cb) => queueFeature(conf.address, {
        id: 11,
        type: 'Feature',
        properties: {
            'carmen:addressnumber': ['1'],
            'carmen:text': 'Main St',
            'carmen:center': [45, 45]
        },
        geometry :{
            type: 'MultiPoint',
            coordinates: [[45, 45]]
        }
    }, cb));
    // this one is inside the country but not in the squishy feature
    q.defer((cb) => queueFeature(conf.address, {
        id: 12,
        type: 'Feature',
        properties: {
            'carmen:addressnumber': ['1'],
            'carmen:text': 'Main St',
            'carmen:center': [41, 41]
        },
        geometry :{
            type: 'MultiPoint',
            coordinates: [[41, 41]]
        }
    }, cb));
    q.awaitAll(t.end);
});

tape('build queued features', (t) => {
    const q = queue();
    Object.keys(conf).forEach((c) => {
        q.defer((cb) => {
            buildQueued(conf[c], cb);
        });
    });
    q.awaitAll(t.end);
});

tape('find georgia', (t) => {
    c.geocode('georgia', {}, (err, res) => {
        t.equal(res.features[0].id, 'region.1');
        t.equal(res.features[0].relevance, 1.00);
        t.end();
    });
});

tape('find 1 main st georgia', (t) => {
    c.geocode('1 main st georgia', {}, (err, res) => {
        t.equal(res.features.filter((feat) => feat.id.match(/address/)).length, 3, 'got all three addresses back');
        t.equal(res.features[0].id, 'address.11', 'squishy one comes back first');
        t.equal(res.features[0].relevance, 1.00);

        t.end();
    });
});

tape('teardown', (t) => {
    context.getTile.cache.reset();
    t.end();
});
