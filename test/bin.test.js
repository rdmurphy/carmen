var fs = require('fs');
var path = require('path');
var tape = require('tape');
var exec = require('child_process').exec;
var tmpdir = require('os').tmpdir();
var bin = path.resolve(path.join(__dirname, '..', 'scripts'));
var fixture = path.resolve(path.join(__dirname, '..', 'tiles'));

var Carmen = require('../index.js');
var MBTiles = require('mbtiles');
var Memsource = require('../lib/api-mem');
var tmpindex = path.join(tmpdir, 'test-carmen-index.mbtiles');
var addFeature = require('../lib/util/addfeature');

tape('index', function(assert) {
    try { fs.unlinkSync(tmpindex); } catch(err) {}
    var mbtiles = new MBTiles(tmpindex, start);
    var carmen = new Carmen({ index: mbtiles });
    function start(err) {
        assert.ifError(err);
        mbtiles.startWriting(write1);
    }
    function write1(err) {
        assert.ifError(err);
        addFeature(mbtiles, {
            _id:38,
            _text:'Canada',
            _zxy:['6/32/32'],
            _center:[0,0]
        }, write2);
    }
    function write2(err) {
        assert.ifError(err);
        addFeature(mbtiles, {
            _id:39,
            _text:'Brazil',
            _zxy:['6/32/32'],
            _center:[0,0]
        }, store);
    }
    function store(err) {
        assert.ifError(err);
        require('../lib/index.js').teardown();
        require('../lib/index.js').store(mbtiles, stop);
    }
    function stop(err) {
        assert.ifError(err);
        mbtiles.stopWriting(assert.end);
    }
});

tape('bin/carmen DEBUG', function(t){
    exec(bin + '/carmen.js ' + tmpindex + ' --query="canada" --debug="38"', function(err, stdout, stderr) {
        t.ifError(err);
        t.equal(/0\.99 Canada/.test(stdout), true, 'finds canada');
        t.ok(stdout.indexOf('phrasematch:') !== -1, 'debug phrase match');
        t.ok(stdout.indexOf('spatialmatch:') !== -1, 'debug spatial');
        t.ok(stdout.indexOf('spatialmatch_position:') !== -1, 'debug spatial');
        t.ok(stdout.indexOf('verifymatch:') !== -1, 'debug verify match');
        t.ok(stdout.indexOf('verifymatch_position:') !== -1, 'debug verify match');
        t.end();
    });
});

tape('bin/carmen', function(t) {
    exec(bin + '/carmen.js', function(err, stdout, stderr) {
        t.equal(1, err.code);
        t.equal("Usage: carmen.js [file|dir] --query=\"<query>\"\n", stdout);
        t.end();
    });
});
tape('bin/carmen query', function(t) {
    exec(bin + '/carmen.js ' + tmpindex + ' --query=brazil', function(err, stdout, stderr) {
        t.ifError(err);
        t.equal(/0\.99 Brazil/.test(stdout), true, 'finds brazil');
        t.end();
    });
});
tape('bin/carmen-copy noargs', function(t) {
    exec(bin + '/carmen-copy.js', function(err, stdout, stderr) {
        t.equal(1, err.code);
        t.equal("Usage: carmen-copy.js <from> <to>\n", stdout);
        t.end();
    });
});
tape('bin/carmen-copy 1arg', function(t) {
    exec(bin + '/carmen-copy.js ' + tmpindex, function(err, stdout, stderr) {
        t.equal(1, err.code);
        t.equal("Usage: carmen-copy.js <from> <to>\n", stdout);
        t.end();
    });
});
tape('bin/carmen-copy', function(t) {
    var dst = tmpdir + '/carmen-copy-test.mbtiles';
    exec(bin + '/carmen-copy.js ' + tmpindex + ' ' + dst, function(err, stdout, stderr) {
        t.ifError(err);
        t.equal(/Copying/.test(stdout), true);
        t.equal(/Done\./.test(stdout), true);
        t.equal(fs.statSync(dst).size > 20e3, true);
        t.equal(fs.unlinkSync(dst), undefined, 'cleanup');
        t.end();
    });
});
