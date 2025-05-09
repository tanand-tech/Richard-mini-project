import type { Config, Row, Data } from '~/postgres';

import config from 'config';
import { date } from '@/util';
import { camelCase } from 'lodash';
import pg, { QueryConfig } from 'pg';
import logger, { LogLevel } from 'logger';

// Type setters
pg.types.setTypeParser(pg.types.builtins.INT8, parseInt);
pg.types.setTypeParser(pg.types.builtins.NUMERIC, parseFloat);
pg.types.setTypeParser(pg.types.builtins.JSONB, JSON.parse);

const log = logger('POSTGRES');
log.setLogLevel(<LogLevel>process.env.POSTGRES_LOG_LEVEL || 'info');

const subscribers: Record<string, ((data: any) => any)[]> = {};

const pool = new pg.Pool(config.get<Config>('postgres'));
pool.on('error', (e) => {
    log.fatal('Unexpected error on idle client', e);
    process.exit(-1);
});

let listener: pg.PoolClient;
export async function init(): Promise<void> {
    listener = await pool.connect();

    listener.on('notification', ({ channel, payload }) => {
        try {
            const data = JSON.parse(payload!);
            log.debug('Incoming notification', { channel, data });
            subscribers[channel].forEach((callback) => callback(data));
        } catch (e) {
            log.error(e);
        }
    });
}

export async function listen<T>(channel: string, callback: (data: T) => any): Promise<void> {
    try {
        if (!subscribers[channel]) {
            subscribers[channel] = [];
            await listener.query(`listen ${channel}`);
        }
        subscribers[channel].push(callback);
    } catch (e) {
        log.error(e);
        throw e;
    }
}

export function parse<R extends Row>(row: R): Data<R> {
    // @ts-ignore
    return Object.fromEntries(Object.entries(row).map(([k, v]) => [camelCase(k), v instanceof Date ? date(v) : v]));
}

export async function query<R extends Row>(query: string | QueryConfig, values?: any[]): Promise<Data<R>[]> {
    try {
        return (await pool.query<R>(query, values)).rows.map(parse);
    } catch (e) {
        log.error(query, values);
        throw e;
    }
}

export async function client(): Promise<pg.PoolClient> {
    return pool.connect();
}

export * as user from './user';
export * as alert from './alert';
