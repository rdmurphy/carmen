var tape = require('tape');
var Carmen = require('..');
var mem = require('../lib/api-mem');

tape('legacy version (pre-v1 => ok)', function(t) {
    var c = new Carmen({
        test: new mem({ maxzoom:6, geocoder_version:null }, function() {})
    });
    c.geocode('test', {}, function(err, res) {
        t.ifError(err);
        t.equal(res.features.length, 0);
        t.end();
    });
});


tape('legacy version (v1 => error)', function(t) {
    var c = new Carmen({
        test: new mem({ maxzoom:6, geocoder_version:1 }, function() {})
    });
    c.geocode('test', {}, function(err, res) {
        t.ok(err);
        t.deepEqual(err.toString(), 'Error: geocoder version is not 8, index: test');
        t.end();
    });
});

tape('current version (v2 => error)', function(t) {
    var c = new Carmen({
        test: new mem({ maxzoom:6, geocoder_version:2 }, function() {})
    });
    c.geocode('test', {}, function(err, res) {
        t.ok(err);
        t.deepEqual(err.toString(), 'Error: geocoder version is not 8, index: test');
        t.end();
    });
});

tape('current version (v3 => error)', function(t) {
    var c = new Carmen({
        test: new mem({ maxzoom:6, geocoder_version:3 }, function() {})
    });
    c.geocode('test', {}, function(err, res) {
        t.ok(err);
        t.deepEqual(err.toString(), 'Error: geocoder version is not 8, index: test');
        t.end();
    });
});

tape('current version (v4 => error)', function(t) {
    var c = new Carmen({
        test: new mem({ maxzoom:6, geocoder_version:4 }, function() {})
    });
    c.geocode('test', {}, function(err, res) {
        t.ok(err);
        t.deepEqual(err.toString(), 'Error: geocoder version is not 8, index: test');
        t.end();
    });
});

tape('current version (v5 => error)', function(t) {
    var c = new Carmen({
        test: new mem({ maxzoom:6, geocoder_version:5 }, function() {})
    });
    c.geocode('test', {}, function(err, res) {
        t.ok(err);
        t.deepEqual(err.toString(), 'Error: geocoder version is not 8, index: test');
        t.end();
    });
});

tape('current version (v6 => error)', function(t) {
    var c = new Carmen({
        test: new mem({ maxzoom:6, geocoder_version:6 }, function() {})
    });
    c.geocode('test', {}, function(err, res) {
        t.ok(err);
        t.deepEqual(err.toString(), 'Error: geocoder version is not 8, index: test');
        t.end();
    });
});

tape('current version (v6 => error)', function(t) {
    var c = new Carmen({
        test: new mem({ maxzoom:6, geocoder_version:7 }, function() {})
    });
    c.geocode('test', {}, function(err, res) {
        t.ok(err);
        t.deepEqual(err.toString(), 'Error: geocoder version is not 8, index: test');
        t.end();
    });
});
