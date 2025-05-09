import type { IClientOptions } from 'mqtt';

export type Config = {
    host: string;
    port?: number;
    topicPrefix?: string;
    options: IClientOptions;
};

export type Subscriber = (topic: string, payload: string) => void;
