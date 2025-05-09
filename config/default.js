const projectId = 'sensordb';

exports.api = {
    port: 8080,
};

exports.mqtt = {
    host: 'localhost',
    port: 1883,
    topicPrefix: '',
};

exports.redis = {
    host: 'localhost',
    port: 6379,
    namespace: projectId,
};

exports.postgres = {
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: '',
    database: projectId,
};

exports.influx = {
    url: 'https://us-east-1-1.aws.cloud2.influxdata.com',
    org: 'tanand-tech',
    bucket: 'TemperatureBucket',
    token: 'zOsYbuYL58yQhvCmyvdjjlwF47va-Ciy9hr-8WQFR1gRgzcfOhOzIk9jfbHKLX6FsepNNNcMEuVToAy4nFG8Lg=='
};

const { readFileSync } = require('fs');
exports.auth = {
    project: projectId,
    privateKey: '',
    publicKey: '',
};
