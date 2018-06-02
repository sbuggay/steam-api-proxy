const redis = require("redis");
const { promisify } = require("util");

class Cache {
    constructor() {
        // this.client = redis.createClient();
        this.client = null;
        this.inMemoryCache = {};
        console.log(this.client);
        if (this.client) {
            console.log("Using REDIS");
            this.getAsync = promisify(this.client.get).bind(this.client);
            this.existsAsync = promisify(this.client.exists).bind(this.client);

        }
        else {
            console.log("No REDIS, using in-memory cache")
        }
        
    }

    // todo: refactor if (client)
    clear() {
        if (this.client) {
            this.client.clear();
        }
        else {
            this.inMemoryCache = {};
        }
    }

    get(key) {
        if (this.client) {
            return this.getAsync(key).then(res => JSON.parse(res));
        }
        else {
            return new Promise(resolve => resolve(this.inMemoryCache[key]));
        }
    }

    set(key, value) {
        if (this.client) {
            return this.client.set(key, JSON.stringify(value));
        }
        else {
            return new Promise(resolve => resolve(this.inMemoryCache[key] = value));
        }
    }

    exists(key) {
        if (this.client) {
            return this.existsAsync(key);
        }
        else {
            return new Promise(resolve => resolve(this.inMemoryCache.hasOwnProperty(key)));
        }
    }
}

module.exports = Cache;