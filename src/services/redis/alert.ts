import { AlertListener } from '~/redis';

import redis from './index';
import logger from 'logger';

const log = logger('REDIS', 'ALERT');

export async function alert<T extends Json = Json, P extends Json = Json>(): Promise<Alert<T, P> | undefined> {
    return redis.lpop(`${redis.namespace}:alert:cache`);
}

export async function setAlert(alert: Alert, front = false): Promise<number> {
    return redis[front ? 'lpush' : 'rpush'](`${redis.namespace}:alert:cache`, alert);
}

export async function listenAlert(listener: AlertListener): Promise<void> {
    try {
        await redis.psubscribe(`__keyspace@${redis.db}__:${redis.namespace}:alert:cache`, async (p, k, event) => {
            try {
                if (event === 'lpush' || event === 'rpush') await listener();
            } catch (e) {
                log.error(e);
            }
        });
    } catch (e) {
        log.error(e);
    }
}

export async function hasAlerts(): Promise<boolean> {
    return !!(await redis.exists(`${redis.namespace}:alert:cache`));
}
