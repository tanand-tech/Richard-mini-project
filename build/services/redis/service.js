"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ioredis_1 = __importDefault(require("ioredis"));
const logger_1 = __importDefault(require("logger"));
const log = (0, logger_1.default)('REDIS');
class RedisService {
    db;
    namespace;
    client;
    subscriber;
    subscribers = {};
    psubscribers = {};
    constructor(options = {}, namespace = 'redis', minLevel) {
        if (minLevel)
            log.setLogLevel(minLevel);
        this.namespace = namespace;
        this.client = new ioredis_1.default(options);
        this.subscriber = new ioredis_1.default(options);
        this.db = (this.client.options.db ?? 0).toString();
        this.subscriber.on('message', (channel, message) => {
            log.debug('message', { channel, message });
            this.subscribers[channel]?.forEach((subscriber) => subscriber(channel, message));
        });
        this.subscriber.on('pmessage', (pattern, channel, message) => {
            log.debug('pmessage', { pattern, channel, message });
            this.psubscribers[pattern]?.forEach((subscriber) => subscriber(pattern, channel, message));
        });
        this.client.config('SET', 'notify-keyspace-events', 'KEA').then(() => log.info('keyspace-events enabled'));
        this.client.on('error', log.fatal);
        this.subscriber.on('error', log.fatal);
    }
    async keys(pattern) {
        return (await this.client.keys(pattern)) ?? [];
    }
    async set(key, value) {
        return this.client.set(key, JSON.stringify(value));
    }
    async setex(key, ttl, value) {
        return this.client.setex(key, ttl, JSON.stringify(value));
    }
    async get(key) {
        const data = await this.client.get(key);
        return data == null ? undefined : JSON.parse(data);
    }
    async hkeys(key) {
        return (await this.client.hkeys(key)) ?? [];
    }
    async hset(key, field, value) {
        return this.client.hset(key, field, JSON.stringify(value));
    }
    async hmset(key, values, clean = false) {
        if (clean)
            await this.del(key);
        return this.client.hset(key, ...Object.entries(values)
            .map(([field, value]) => [field, JSON.stringify(value)])
            .flat());
    }
    async hsetnx(key, field, value) {
        const set = await this.client.hsetnx(key, field, JSON.stringify(value));
        return set ? value : (await this.hget(key, field));
    }
    async hget(key, field) {
        const data = await this.client.hget(key, field);
        return data == null ? undefined : JSON.parse(data);
    }
    async hgetall(key) {
        const data = await this.client.hgetall(key);
        if (!data || !Object.keys(data).length)
            return undefined;
        return Object.fromEntries(Object.entries(data).map(([key, value]) => [key, JSON.parse(value)]));
    }
    async hdel(key, field) {
        return this.client.hdel(key, field);
    }
    async hlen(key) {
        return this.client.hlen(key);
    }
    async del(...keys) {
        return this.client.del(keys);
    }
    async exists(...keys) {
        return this.client.exists(keys);
    }
    async llen(key) {
        return this.client.llen(key);
    }
    async lpush(key, value) {
        return this.client.lpush(key, JSON.stringify(value));
    }
    async lpop(key) {
        const data = await this.client.lpop(key);
        return data == null ? undefined : JSON.parse(data);
    }
    async rpush(key, value) {
        return this.client.rpush(key, JSON.stringify(value));
    }
    async rpop(key) {
        const data = await this.client.rpop(key);
        return data == null ? undefined : JSON.parse(data);
    }
    async subscribe(channel, subscriber) {
        if (!this.subscribers[channel]) {
            this.subscribers[channel] = [];
            await this.subscriber.subscribe(channel);
        }
        this.subscribers[channel].push(subscriber);
    }
    unsubscribe(channel, subscriber) {
        if (!this.subscribers[channel]) {
            log.warn(`Attempting to unsubscribe from unsubscribed channel ${channel}`);
            return;
        }
        const index = this.subscribers[channel].indexOf(subscriber);
        if (index === -1)
            log.error(`Subscriber not found in channel ${channel}`);
        else {
            this.subscribers[channel].splice(index, 1);
            this.subscriber.unsubscribe(channel).then(() => delete this.subscribers[channel]);
        }
    }
    async psubscribe(pattern, subscriber) {
        if (!this.psubscribers[pattern]) {
            this.psubscribers[pattern] = [];
            await this.subscriber.psubscribe(pattern);
        }
        this.psubscribers[pattern].push(subscriber);
    }
    punsubscribe(pattern, subscriber) {
        if (!this.psubscribers[pattern]) {
            log.warn(`Attempting to punsubscribe from unsubscribed pattern ${pattern}`);
            return;
        }
        const index = this.psubscribers[pattern].indexOf(subscriber);
        if (index === -1)
            log.error(`PSubscriber not found in pattern ${pattern}`);
        else {
            this.psubscribers[pattern].splice(index, 1);
            if (!this.psubscribers[pattern].length) {
                this.subscriber.punsubscribe(pattern).then(() => delete this.psubscribers[pattern]);
            }
        }
    }
}
exports.default = RedisService;
//# sourceMappingURL=service.js.map