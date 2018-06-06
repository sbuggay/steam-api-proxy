import { RedisClient, createClient } from "redis";
import { promisify } from "util";

function buildCache(useRedis: boolean = false) {

    if (useRedis) {
        const client = createClient();
        console.log("Using REDIS");
        return new RedisCache(client);
    }
    else {
        console.log("No REDIS, using in-memory cache")
        return new InMemoryCache();
    }
}

interface Cache {
    clear: () => void;
    get: (key: string) => Promise<any>;
    set: (key: string, value: any) => void;
    exists: (key: string) => Promise<boolean>;
}

class RedisCache implements Cache {

    client: RedisClient;
    getAsync: any = null;
    existsAsync: any = null;

    constructor(client: RedisClient) {
        this.client = client;
        this.getAsync = promisify(this.client.get).bind(this.client);
        this.existsAsync = promisify(this.client.exists).bind(this.client);
    }

    clear() {
        this.client.flushall();
    }

    get(key: string) {
        return this.getAsync(key).then((res: any) => JSON.parse(res));
    }

    set(key: string, value: any) {
        return this.client.set(key, JSON.stringify(value));
    }

    exists(key: string) {
        return this.existsAsync(key);
    }
}

interface IInMemoryCache {
    [key: string]: any;
}

class InMemoryCache implements Cache {

    inMemoryCache: IInMemoryCache = {};

    constructor() {
        this.inMemoryCache = {};
    }

    clear() {
        this.inMemoryCache = {};
    }

    get(key: string) {
        return Promise.resolve(this.inMemoryCache[key]);
    }

    set(key: string, value: any) {
        this.inMemoryCache[key] = value;
    }

    exists(key: string) {
        return Promise.resolve(this.inMemoryCache.hasOwnProperty(key));
    }
}

export default buildCache;