"use strict";
require('dotenv').config();
const mqtt = require('mqtt');
const { InfluxDB, Point } = require('@influxdata/influxdb-client');
const token = process.env.INFLUXDB_TOKEN;
const org = '86112a803b0c6cae';
const bucket = 'TemperatureBucket';
const host = 'https://us-east-1-1.aws.cloud2.influxdata.com';
const influx = new InfluxDB({ url: host, token });
const queryApi = influx.getQueryApi(org);
const writeApi = influx.getWriteApi(org, bucket);
writeApi.useDefaultTags({ location: 'site-a' });
//# sourceMappingURL=mqtt-to-influx.js.map