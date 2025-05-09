"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mqtt_1 = require("mqtt");
const mqtt_match_1 = __importDefault(require("mqtt-match"));
const logger_1 = __importDefault(require("logger"));
const log = (0, logger_1.default)('MQTT', 'SERVICE');
class MQTTService {
    retryCount = 0;
    subscribers = {};
    client;
    topicPrefix;
    constructor(host, port, topicPrefix = '', options = {}, minLevel) {
        if (minLevel)
            log.setLogLevel(minLevel);
        this.topicPrefix = topicPrefix;
        const client = (0, mqtt_1.connect)(`mqtt://${host}`, {
            ...options,
            port,
        });
        client.on('connect', () => {
            log.info('Connected to broker');
            this.retryCount = 0;
            const subscriptions = Object.keys(this.subscribers);
            if (subscriptions.length) {
                subscriptions.forEach((topic) => client.subscribe(topic));
                log.info(`Resumed subscriptions of ${subscriptions.length} topics`);
            }
        });
        client.on('error', (e) => log.error(e.message));
        client.on('close', () => {
            if (!(this.retryCount % 10))
                log.warn(`Disconnected from broker ${this.retryCount > 0 ? `[${this.retryCount}]` : ''}`);
            this.retryCount++;
        });
        client.on('message', (topic, payload) => {
            log.debug('Incoming mqtt message', topic, payload.toString());
            Object.entries(this.subscribers).forEach(([topicPattern, handlers]) => {
                if ((0, mqtt_match_1.default)(topicPattern, topic))
                    handlers.forEach((handler) => handler(topic, payload.toString()));
            });
        });
        this.client = client;
    }
    subscribe(topic, handler, prefix = true) {
        if (prefix && this.topicPrefix)
            topic = this.topicPrefix + topic;
        this.client.subscribe(topic);
        if (!this.subscribers[topic])
            this.subscribers[topic] = [];
        log.info(`Subscribed to topic ${topic}`);
        this.subscribers[topic].push(handler);
    }
    publish(topic, payload, options = {}) {
        topic = this.topicPrefix + topic;
        log.debug(`Publishing to topic ${topic} with options ${JSON.stringify(options)}`, payload);
        this.client.publish(topic, typeof payload === 'string' ? payload : JSON.stringify(payload), options);
    }
}
exports.default = MQTTService;
//# sourceMappingURL=service.js.map