# persistent-cache

A simple Node module to persistently store/cache arbitrary data. [NPMJS](https://www.npmjs.com/package/persistent-cache)


## How to install
```shel
npm install persistent-cache
```

add the `--save` option to add `persistent-cache` to the `dependencies` in your `package.json`

## Usage

### Create cache

```js
var cache = require('persistent-cache');

var cats = cache();
```

`cats` is now a cache with the default options, meaning it is a persistent
cache utilizing memory caching for performance, it has the name `cache`, caches
data forever and is located in the `cache`-directory of the current main module.
For all available options, see the bottom of this page.

An empty cache of cats is kind of sad. Let's bring some life to it.

### Insert data

```js
//Asynchronous
cats.put('Cindy', {color: 'red'}, someCallback);

//Synchronous
cats.putSync('babies', ['Ron', 'Emily']);
```

Now our `cats`-cache has an entry `Cindy` containing an object `{color: 'red'}` and an entry `babies` containing an array of some names (strings).

`cache.put(key, data, cb)` will store any arbitrary `data` in the cache under the provided `key` and call the provided callback when done (passing err as the first argument, following node convention). `cache.putSync(key, data)` is the synchronous counterpart (`throw`ing possible errors).

If there is already an entry for the provided key, `cache.put` will overwrite it.

Argh, my dog quit the program. I miss my cats :-( Lets retrieve them from the cache.

### Retrieve data

```js
cats.get('babies', function(err, babies) {
    //check err for errors

    console.log(babies); //['Ron', 'Emily']
});

console.log(cats.getSync('Cindy')); //{ color: 'red' }
```

There they are :D

`cache.get(key, cb)` will get the data saved under `key` from the cache and call the provided callback when done, passing the retrieved data as the second argument (again, passing error first following node convention). `cache.getSync` is the synchronous counterpart, returning the data. If there is no (valid) cache entry for the provided `key`, `undefined` will be returned/passed.

## Getting available keys

I forgot which cats I put in my cache. Fortunately I can look it up:

```js
cats.keys(function(err, keys) {
    //Handle errors

    console.log(keys); //['Cindy', 'babies']
});

console.log(cats.keysSync()); //['Cindy', 'babies']
```

`keys` (and its synchronous counterpart `keysSync`) finds all available keys in a cache.

I found a new owner for my cute cat babies. So I need to remove them from my cache.

### Delete data

```js
cats.delete('babies', function(err) {
    //Handle errors

    console.log('babies removed from cache');
});
```

I safely removed my cat babies from the cache. Yey!

`cache.delete(key, cb)` will remove the provided `key` from the cache and call the provided callback when done. `cache.deleteSync` is the synchronous counterpart.

## Tidying up

If you want to delete the folder and files of a persistent cache, simply call `unlink` on it:

```js
cache.unlink(function(err) {
    //The cache folder and files are gone now
})
```

A persistent cache will obviously not work anymore after `unlink`ing it.

## Options

```js
var someCache = cache({
    base: 'some/folder',
    name: 'foo',
    duration: 1000 * 3600 * 24 //one day
});
```

When creating a new cache, you may pass an options object, with the following available properties:

### `options.base`

The base directory where `persistent-cache` will save its caches.

Defaults to the main modules directory

### `options.name`

The name of the cache. Determines the name of the created folder where the data is stored, which is just `base + name`.

Defaults to `cache`

### `options.duration`

The amount of milliseconds a cache entry should be valid for. If not set, cache entries are not invalidated (stay until deleted).

Defaults to `undefined` (infinite)

### `options.memory`

Whether the cache should use memory caching or not (mirrors all cache data in the ram,
saving disk I/O and increasing performance).

Defaults to `true`

### `options.persist`

Whether the cache should be persistent, aka if it should write its data to the disk
for later use or not. Set this to `false` to create a memory-only cache.

Defaults to `true`
