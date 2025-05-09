"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dayjs_1 = __importDefault(require("dayjs"));
const child_process_1 = require("child_process");
const logger_1 = __importDefault(require("logger"));
const fs_1 = require("fs");
const influxdb_client_1 = require("@influxdata/influxdb-client");
const log = (0, logger_1.default)('INFLUX');
const precisions = {
    s: 1000_000_000,
    ms: 1000_000,
    us: 1000,
    ns: 1,
};
const DEFAULT_WRITE_OPTIONS = {
    batchSize: 500,
    flushInterval: 5000,
    maxRetries: 0,
};
class InfluxService {
    writeApi;
    queryApi;
    constructor(url, token, org, bucket, writeOptions = {}, minLevel) {
        if (minLevel)
            log.setLogLevel(minLevel);
        const PATH = `./influx/${bucket}/`;
        if (!(0, fs_1.existsSync)(PATH))
            (0, fs_1.mkdirSync)(PATH, { recursive: true });
        let fails = 0;
        const influxDB = new influxdb_client_1.InfluxDB({ url, token, timeout: 60000 });
        this.queryApi = influxDB.getQueryApi(org);
        this.writeApi = influxDB.getWriteApi(org, bucket, 'ns', {
            ...DEFAULT_WRITE_OPTIONS,
            ...writeOptions,
            writeSuccess(lines) {
                fails = 0;
                log.debug(`Write success! ${lines.length} points flushed`);
            },
            async writeFailed(error, lines, attempts) {
                log.warn(`${lines.length} lines failed ${attempts} times due to ${error.message}`);
                return new Promise((resolve) => {
                    (0, fs_1.appendFileSync)(PATH + (0, dayjs_1.default)().format('YYYY-MM-DD') + '.lp', lines.join('\n') + '\n');
                    log.info(`${lines.length} points cached`);
                    if (++fails >= 5)
                        (0, child_process_1.exec)('sudo -S systemctl restart influxdb', (e) => {
                            if (e)
                                log.fatal('Error restarting Influx', e);
                            else
                                log.fatal('InfluxDB restarted');
                        });
                    resolve();
                });
            },
        });
    }
    async query(query) {
        try {
            return (await this.queryApi.collectRows(query)) ?? [];
        }
        catch (e) {
            if (e.code !== 'ECONNREFUSED') {
                log.warn(e);
                console.log(query);
            }
            throw e;
        }
    }
    async flush() {
        return this.writeApi.flush();
    }
    write(payload) {
        Array.isArray(payload) ? payload.forEach(this.writePoint.bind(this)) : this.writePoint(payload);
        log.silly('Write success');
    }
    writePoint(payload) {
        try {
            const { measurement, timestamp, tags, fields, precision = 's' } = payload;
            if (timestamp == null)
                throw Error('Missing timestamp');
            if (measurement == null)
                throw Error('Missing measurement');
            if (fields == null)
                throw Error('Missing fields');
            const point = new influxdb_client_1.Point(measurement).timestamp(typeof timestamp === 'number' ? timestamp * precisions[precision] : (0, dayjs_1.default)(timestamp).toDate());
            Object.entries(tags).forEach(([key, val]) => val != null && point.tag(key, val));
            Object.entries(fields).forEach(([key, val]) => {
                if (val == null)
                    return;
                switch (typeof val) {
                    case 'number':
                        point.floatField(key, val);
                        break;
                    case 'boolean':
                        point.booleanField(key, val);
                        break;
                    case 'string':
                        point.stringField(key, val);
                        break;
                    default:
                        throw Error(`Unhandled typeof ${typeof val} in ${key}: ${val}`);
                }
            });
            this.writeApi.writePoint(point);
        }
        catch (e) {
            log.fatal(e, payload);
            throw e;
        }
    }
}
exports.default = InfluxService;
//# sourceMappingURL=service.js.map