import type { Config } from '~/mqtt';
import type { LogLevel } from 'logger';

import config from 'config';
import MQTTService from './service';

const { host, port, topicPrefix, options } = config.get<Config>('mqtt');

const mqtt = new MQTTService(host, port, topicPrefix, options, <LogLevel>process.env.MQTT_LOG_LEVEL ?? 'info');

export default mqtt;
