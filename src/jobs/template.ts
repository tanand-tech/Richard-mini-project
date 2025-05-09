import logger from 'logger';
import cron from 'node-schedule';

const log = logger('JOBS', 'TEMPLATE');

cron.scheduleJob('*/1 * * * *', (date = new Date()) => {
    log.info(date.toISOString());
});
