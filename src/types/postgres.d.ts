import { ClientConfig } from 'pg';

export type Config = ClientConfig;

export type Row = Record<string, Date | Json>;

type SnakeToCamelCase<S extends string | number | symbol> = S extends `${infer T}_${infer U}`
    ? `${T}${Capitalize<SnakeToCamelCase<U>>}`
    : S;

export type Data<R extends Row> = {
    [K in keyof R as SnakeToCamelCase<K>]: R[K] extends Date
        ? string
        : R[K] extends Date | null
          ? ISOString | null
          : R[K];
};

export type alert<Tags extends Json = Json, Params extends Json = Json> = {
    type: string;
    tags: Tags;
    timestamp: Date;
    resolve: Date | null;
    last_alert: Date | null;
    last_trigger: Date;
    params: Params;
    mute: boolean;
    count: number;
};

export type Alert<Tags extends Json = Json, Params extends Json = Json> = Data<alert<Tags, Params>>;

export type user = {
    user_id: string;
    email: string;
    telegram_id: string | null;
    subscriptions: string | null;
    grafana_id: number;
};

type User = Data<user>;
