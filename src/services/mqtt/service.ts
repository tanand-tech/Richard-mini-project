import type { Subscriber } from '~/mqtt';
import type { IClientOptions, IClientPublishOptions, MqttClient } from 'mqtt';

import { connect } from 'mqtt';
import match from 'mqtt-match';
import logger, { LogLevel } from 'logger';

const log = logger('MQTT', 'SERVICE');

export default class MQTTService {
    private retryCount = 0;
    private subscribers: Record<string, Subscriber[]> = {};
    private readonly client: MqttClient;

    private readonly topicPrefix: string;

    constructor(host: string, port?: number, topicPrefix = '', options: IClientOptions = {}, minLevel?: LogLevel) {
        if (minLevel) log.setLogLevel(minLevel);

        this.topicPrefix = topicPrefix;
        const client = connect(`mqtt://${host}`, {
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
                if (match(topicPattern, topic)) handlers.forEach((handler) => handler(topic, payload.toString()));
            });
        });

        this.client = client;
    }

    subscribe(topic: string, handler: Subscriber, prefix = true): void {
        if (prefix && this.topicPrefix) topic = this.topicPrefix + topic;

        this.client.subscribe(topic);
        if (!this.subscribers[topic]) this.subscribers[topic] = [];

        log.info(`Subscribed to topic ${topic}`);

        this.subscribers[topic].push(handler);
    }

    publish(topic: string, payload: any, options: IClientPublishOptions = {}): void {
        topic = this.topicPrefix + topic;

        log.debug(`Publishing to topic ${topic} with options ${JSON.stringify(options)}`, payload);

        this.client.publish(topic, typeof payload === 'string' ? payload : JSON.stringify(payload), options);
    }
}
