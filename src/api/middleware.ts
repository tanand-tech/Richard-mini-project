import type { Request, Response, NextFunction } from 'express';

import dayjs from 'dayjs';
import logger from 'logger';
import cron from 'node-schedule';
import { failure } from '@/api/util';
import { verify } from '@/services/auth';
import { createWriteStream, existsSync, mkdirSync, readdirSync, unlinkSync } from 'fs';

const log = logger('API', 'AUTH');
log.setLogLevel(process.env.LOG_REQUEST === 'true' ? 'debug' : 'info');

const PATH = './logs/api';
if (!existsSync(PATH)) mkdirSync(PATH, { recursive: true });

// Daily removal of files > 30d old
cron.scheduleJob('0 0 * * *', async function (fireDate) {
    try {
        const cutoff = dayjs(fireDate).subtract(30, 'day');

        for (const f of readdirSync(PATH + '/'))
            if (dayjs(f.split('.')[0]).isBefore(cutoff)) unlinkSync(PATH + '/' + f);
    } catch (e) {
        log.error(e);
    }
});

export async function logRequest(request: Request, response: Response, next: NextFunction): Promise<void> {
    const date = dayjs();
    const { method, path, params, query, body, cookies, headers } = request;
    const ip = request.header('x-client-ip') || request.header('x-real-ip') || request.ip;
    log.debug(`Incoming request ${method} ${path} from ${ip}`);

    createWriteStream(`${PATH}/${date.format('YYYY-MM-DD')}.jsonl`, { flags: 'a' }).write(
        `${JSON.stringify({
            time: date.format('YYYY-MM-DD HH:mm:ss'),
            method,
            path,
            headers,
            ip,
            params,
            query,
            body,
            cookies,
        })}\n`
    );
    response.locals.ip = ip;
    response.locals.timestamp = date.unix();
    next();
}

