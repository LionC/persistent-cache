var path = require('path');
var fs = require('fs');
var mkdirp = require('mkdirp-no-bin');

function exists(dir) {
    try {
        fs.accessSync(dir);
    } catch(err) {
        return false;
    }

    return true;
}

function safeCb(cb) {
    if(typeof cb === 'function')
        return cb;

    return function(){};
}

function cache(options) {
    var options = options || {};

    var base = path.normalize((options.dir || (path.dirname(require.main.filename)) + '/cache'));
    var cacheDir = path.normalize(base + '/' + (options.name || 'cache'));
    var cacheInfinitely = !(typeof options.duration === "number");
    var cacheDuration = options.duration;

    if(!exists(cacheDir))
        mkdirp.sync(cacheDir);

    function buildFilePath(name) {
        return path.normalize(cacheDir + '/' + name + '.json');
    }

    function buildCacheEntry(name, data) {
        return {
            cacheUntil: !cacheInfinitely ? new Date().getTime() + cacheDuration : undefined,
            data: data
        };
    }

    function put(name, data, cb) {
        fs.writeFile(buildFilePath(name), JSON.stringify(buildCacheEntry(name, data)), cb);
    }

    function putSync(name, data) {
        fs.writeFileSync(buildFilePath(name), JSON.stringify(buildCacheEntry(name, data)));
    }

    function get(name, cb) {
        fs.readFile(buildFilePath(name), 'utf8' ,onFileRead);

        function onFileRead(err, content) {
            if(err != null) {
                return safeCb(cb)('cache entry not found');
            }

            var data = JSON.parse(content);

            if(data.cacheUntil && new Date().getTime() > data.cacheUntil) {
                return safeCb(cb)('cache entry expired');
            }

            return safeCb(cb)(null, data.data);
        }
    }

    function getSync(name) {
        try {
            var data = JSON.parse(fs.readFile(buildFilePath(name), 'utf8' ,onFileRead));
        } catch(e) {
            throw 'cache entry not found';
        }

        if(data.cacheUntil && new Date().getTime() > data.cacheUntil)
            throw 'cache entry expired';

        return data.data;
    }

    function deleteEntry(name, cb) {
        fs.unlink(buildFilePath(name), cb);
    }

    function deleteEntrySync(name) {
        fs.unlinkSync(buildFilePath(name));
    }

    return {
        put: put,
        get: get,
        delete: deleteEntry,

        putSync: putSync,
        getSync: getSync,
        deleteSync: deleteEntrySync
    };
}

module.exports = cache;
