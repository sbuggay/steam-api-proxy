const redis = require("redis");
const { promisify } = require("util");

function buildCache() {
    const client = redis.createClient();
    if (client) {
        console.log("Using REDIS");
        return new RedisCache(client);
    }
    else {
        console.log("No REDIS, using in-memory cache")
        return new InMemoryCache();
    }
}

class Cache {
    constructor() { }
    clear() { }
    get() { }
    set() { }
    exists() { }
}

class RedisCache extends Cache {

    constructor(client) {
        super();
        this.client = client;
        this.getAsync = promisify(this.client.get).bind(this.client);
        this.existsAsync = promisify(this.client.exists).bind(this.client);
    }

    clear() {
        this.client.flushall();
    }

    get(key) {
        return this.getAsync(key).then(res => JSON.parse(res));
    }

    set(key, value) {
        return this.client.set(key, JSON.stringify(value));
    }

    exists(key) {
        return this.existsAsync(key);
    }
}

class InMemoryCache extends Cache {

    constructor() {
        super();
        this.inMemoryCache = {};
    }

    clear() {
        this.inMemoryCache = {};
    }

    get(key) {
        return new Promise(resolve => resolve(this.inMemoryCache[key]));
    }

    set(key, value) {
        return new Promise(resolve => resolve(this.inMemoryCache[key] = value));
    }

    exists(key) {
        return new Promise(resolve => resolve(this.inMemoryCache.hasOwnProperty(key)));
    }
}

module.exports = buildCache;