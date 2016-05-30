var path = require('path');
var fs = require('fs');

function cache(options) {
    var options = options || {};

    var cacheDir = path.dirname(require.main.filename) + '/' + (options.dir || 'cache');
    var cacheInfinitely = options.infinite || false;
    var cacheDuration = options.duration || 3600 * 24 * 7 * 2;

    try {
        fs.accessSync(cacheDir);
    } catch(err) {
        fs.mkdirSync(cacheDir);
    }

    function buildFilePath(name) {
        return cacheDir + '/' + name + '.json';
    }

    function put(name, data, cb) {
        var cacheEntry = {
            cacheUntil: !cacheInfinitely ? new Date().getTime() + cacheDuration : undefined,
            data: data
        };

        fs.writeFile(buildFilePath(name), JSON.stringify(cacheEntry), cb);
    }

    function get(name, cb) {
        fs.readFile(buildFilePath(name), 'utf8' ,onFileRead);

        function onFileRead(err, content) {
            if(err != null) {
                return cb('cache entry not found');
            }

            var data = JSON.parse(content);

            if(new Date().getTime() > data.cacheUntil) {
                return cb('cache entry expired');
            }


            return cb(null, data.data);
        }
    }

    function deleteEntry(name, cb) {
        fs.unlink(buildFilePath(name), cb);
    }

    return {
        put: put,
        get: get,
        delete: deleteEntry
    };
}

module.exports = cache;
