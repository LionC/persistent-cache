var path = require('path');
var fs = require('fs');
var mkdirp = require('mkdirp-no-bin');
var rmdir = require('rmdir');

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

    var base = path.normalize(
        (options.base || (require.main ? path.dirname(require.main.filename) : undefined) || process.cwd())  + '/cache'
    );
    var cacheDir = path.normalize(base + '/' + (options.name || 'cache'));
    var cacheInfinitely = !(typeof options.duration === "number");
    var cacheDuration = options.duration;
    var ram = typeof options.memory == 'boolean' ? options.memory : true;
    var persist = typeof options.persist == 'boolean' ? options.persist : true;

    if(ram)
        var memoryCache = {};

    if(persist && !exists(cacheDir))
        mkdirp.sync(cacheDir);

    function buildFilePath(name) {
        return path.normalize(cacheDir + '/' + name + '.json');
    }

    function buildCacheEntry(data) {
        return {
            cacheUntil: !cacheInfinitely ? new Date().getTime() + cacheDuration : undefined,
            data: data
        };
    }

    function put(name, data, cb) {
        var entry = buildCacheEntry(data);

        if(persist)
            fs.writeFile(buildFilePath(name), JSON.stringify(entry), cb);

        if(ram) {
            entry.data = JSON.stringify(entry.data);

            memoryCache[name] = entry;

            if(!persist)
                return safeCb(cb)(null);
        }
    }

    function putSync(name, data) {
        var entry = buildCacheEntry(data);

        if(persist)
            fs.writeFileSync(buildFilePath(name), JSON.stringify(entry));

        if(ram) {
            memoryCache[name] = entry;
            memoryCache[name].data = JSON.stringify(memoryCache[name].data);
        }
    }

    function get(name, cb) {
        if(ram && !!memoryCache[name]) {
            var entry = memoryCache[name];

            if(!!entry.cacheUntil && new Date().getTime() > entry.cacheUntil) {
                return safeCb(cb)(null, undefined);
            }

            return safeCb(cb)(null, JSON.parse(entry.data));
        }

        fs.readFile(buildFilePath(name), 'utf8' ,onFileRead);

        function onFileRead(err, content) {
            if(err != null) {
                return safeCb(cb)(null, undefined);
            }

            var entry = JSON.parse(content);

            if(!!entry.cacheUntil && new Date().getTime() > entry.cacheUntil) {
                return safeCb(cb)(null, undefined);
            }

            return safeCb(cb)(null, entry.data);
        }
    }

    function getSync(name) {
        if(ram && !!memoryCache[name]) {
            var entry = memoryCache[name];

            if(entry.cacheUntil && new Date().getTime() > entry.cacheUntil) {
                return undefined;
            }

            return JSON.parse(entry.data);
        }

        try {
            var data = JSON.parse(fs.readFileSync(buildFilePath(name), 'utf8'));
        } catch(e) {
            return undefined;
        }

        if(data.cacheUntil && new Date().getTime() > data.cacheUntil)
            return undefined;

        return data.data;
    }

    function deleteEntry(name, cb) {
        if(ram) {
            delete memoryCache[name];

            if(!persist)
                safeCb(cb)(null);
        }

        fs.unlink(buildFilePath(name), cb);
    }

    function deleteEntrySync(name) {
        if(ram) {
            delete memoryCache[name];

            if(!persist)
                return;
        }

        fs.unlinkSync(buildFilePath(name));
    }

    function unlink(cb) {
        if(persist)
            return rmdir(cacheDir, safeCb(cb));

        safeCb(cb)(null);
    }

    return {
        put: put,
        get: get,
        delete: deleteEntry,

        putSync: putSync,
        getSync: getSync,
        deleteSync: deleteEntrySync,

        unlink: unlink
    };
}

module.exports = cache;
