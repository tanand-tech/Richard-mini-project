import type { WriteOptions } from '@influxdata/influxdb-client';

export type Config = {
    url: string;
    bucket: string;
    org: string;
    token: string;
    writeOptions?: Partial<WriteOptions>;
};

export type DeletePredicate = {
    start: string;
    stop: string;
    predicate: string;
};

export type Payload = {
    timestamp: string | number | Date;
    measurement: string;
    precision?: 's' | 'ms' | 'us' | 'ns';
    tags: { [key: string]: string | undefined | null };
    fields: { [key: string]: number | boolean | string | undefined | null };
};
