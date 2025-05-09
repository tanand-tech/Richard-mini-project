import type { Payload } from '~/influx';

import dayjs from 'dayjs';
import { exec } from 'child_process';
import logger, { LogLevel } from 'logger';
import { appendFileSync, existsSync, mkdirSync } from 'fs';
import { InfluxDB, Point, QueryApi, WriteApi, WriteOptions, ParameterizedQuery } from '@influxdata/influxdb-client';

const log = logger('INFLUX');
const precisions = {
    s: 1000_000_000,
    ms: 1000_000,
    us: 1000,
    ns: 1,
};

const DEFAULT_WRITE_OPTIONS: Partial<WriteOptions> = {
    batchSize: 500,
    flushInterval: 5000,
    maxRetries: 0,
};
export default class InfluxService {
    writeApi: WriteApi;
    private queryApi: QueryApi;

    constructor(
        url: string,
        token: string,
        org: string,
        bucket: string,
        writeOptions: Partial<WriteOptions> = {},
        minLevel?: LogLevel
    ) {
        if (minLevel) log.setLogLevel(minLevel);

        const PATH = `./influx/${bucket}/`;
        if (!existsSync(PATH)) mkdirSync(PATH, { recursive: true });

        let fails = 0;

        const influxDB = new InfluxDB({ url, token, timeout: 60000 });
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
                    appendFileSync(PATH + dayjs().format('YYYY-MM-DD') + '.lp', lines.join('\n') + '\n');
                    log.info(`${lines.length} points cached`);

                    if (++fails >= 5)
                        exec('sudo -S systemctl restart influxdb', (e) => {
                            if (e) log.fatal('Error restarting Influx', e);
                            else log.fatal('InfluxDB restarted');
                        });
                    resolve();
                });
            },
        });
    }

    async query<T>(query: string | ParameterizedQuery): Promise<({ table: number; result: string } & T)[]> {
        try {
            return (await this.queryApi.collectRows(query)) ?? [];
        } catch (e) {
            if (e.code !== 'ECONNREFUSED') {
                log.warn(e);
                console.log(query);
            }
            throw e;
        }
    }

    async flush(): Promise<void> {
        return this.writeApi.flush();
    }

    write<T extends Payload>(payload: T | T[]): void {
        Array.isArray(payload) ? payload.forEach(this.writePoint.bind(this)) : this.writePoint(payload);
        log.silly('Write success');
    }

    private writePoint(payload: Payload): void {
        try {
            const { measurement, timestamp, tags, fields, precision = 's' } = payload;
            if (timestamp == null) throw Error('Missing timestamp');
            if (measurement == null) throw Error('Missing measurement');
            if (fields == null) throw Error('Missing fields');

            const point = new Point(measurement).timestamp(
                typeof timestamp === 'number' ? timestamp * precisions[precision] : dayjs(timestamp).toDate()
            );

            Object.entries(tags).forEach(([key, val]) => val != null && point.tag(key, val));
            Object.entries(fields).forEach(([key, val]) => {
                if (val == null) return;
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
        } catch (e) {
            log.fatal(e, payload);
            throw e;
        }
    }
}
