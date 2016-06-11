var should = require('should');
var persistentCache = require('../index.js');
var fs = require('fs');
var path = require('path');

function exists(dir) {
    try {
        fs.accessSync(dir);
    } catch(err) {
        return false;
    }

    return true;
}

describe('persistent-cache', function() {
    describe('core (default options)', function() {
        var cache;
        var dir = path.normalize(path.dirname(require.main.filename) + '/cache/cache');

        before(function() {
            cache = persistentCache();
        });

        after(function() {
            cache.unlink();
        });

        it('should create the default folders', function() {
            exists(dir).should.equal(true);
        });

        it('should put data', function(done) {
            cache.put('someObject', {a: 2, b: true}, done);
        });

        it('should put data synchronously', function() {
            should(cache.putSync('isWaterWet', true)).not.throw();
        });

        it('should get previously put data', function(done) {
            cache.get('isWaterWet', function(err, data) {
                should(err).equal(null);
                data.should.equal(true);

                done();
            });
        });

        it('should get previously put data synchronously', function() {
            cache.getSync('someObject').should.eql({a: 2, b: true});
        });

        it('should share data across instances (and thus restarts)', function() {
            persistentCache().getSync('someObject').should.eql({a: 2, b: true});
        });

        it('should return undefined on getting a nonexistent entry', function(done) {
            cache.get('iDontExist', function(err, data) {
                should(err).equal(null);
                should(data).equal(undefined);
                done();
            });
        });

        it('should return undefined on getting a nonexistent entry synchronously', function() {
            should(cache.getSync('iDontExistEither')).equal(undefined);
        });

        it('should delete data', function(done) {
            cache.delete('isWaterWet', function(err) {
                should(err).equal(null);

                cache.get('isWaterWet', function(err, data) {
                    should(err).equal(null);
                    should(data).equal(undefined);
                    done();
                });
            });
        });

        it('should delete data synchronously', function() {
            should(cache.deleteSync('someObject')).not.throw();
            should(cache.getSync('someObject')).equal(undefined);
        });

        it('should delete its folder when unlinking', function() {
            cache.unlink(function(err) {
                should(err).equal(null);
                exists(dir).should.equal(false);
            });
        });
    });

    describe('memory-only', function() {
        var cache;

        before(function() {
            cache = persistentCache({
                persist: false,
                dir: './'
            });
        });

        it('should not create a folder', function() {
            exists('./cache').should.equal(false);
        });

        it('should unlink without an error', function(done) {
            cache.unlink(done);
        });
    });
});
