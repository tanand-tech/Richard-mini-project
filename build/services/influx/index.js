"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bucket = exports.service = void 0;
exports.int = int;
exports.float = float;
exports.string = string;
exports.array = array;
exports.datetime = datetime;
exports.write = write;
exports.flush = flush;
exports.query = query;
const config_1 = __importDefault(require("config"));
const service_1 = __importDefault(require("./service"));
const influxdb_client_1 = require("@influxdata/influxdb-client");
const { url, token, org, bucket, writeOptions } = config_1.default.get('influx');
exports.bucket = bucket;
exports.service = new service_1.default(url, token, org, bucket, writeOptions);
function int(value) {
    return (0, influxdb_client_1.fluxInteger)(value).toString();
}
function float(value) {
    return (0, influxdb_client_1.fluxFloat)(Number.isInteger(value) ? value.toFixed(1) : value).toString();
}
function string(value) {
    return (0, influxdb_client_1.fluxString)(value).toString();
}
function array(value) {
    return (0, influxdb_client_1.toFluxValue)(value);
}
function datetime(value, unit = 's') {
    switch (unit) {
        case 's':
            value *= 1000;
            break;
        case 'ms':
            break;
        case 'us':
            value /= 1000;
            break;
        case 'ns':
            value /= 1000_000;
            break;
        default:
            throw Error(`Unknown precision of type ${unit}`);
    }
    return (0, influxdb_client_1.fluxDateTime)(new Date(value).toISOString()).toString();
}
function write(payload) {
    return exports.service.write(payload);
}
async function flush() {
    return exports.service.flush();
}
async function query(query) {
    return exports.service.query(query);
}
//# sourceMappingURL=index.js.map