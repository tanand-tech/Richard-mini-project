import type { Telegram } from 'telegraf';

export type Config = {
    endpoint: string;
};

type SendMessageParams = Jsoned<Parameters<Telegram['sendMessage']>>;
type SendPhotoParams = Jsoned<Parameters<Telegram['sendPhoto']>>;

export type Forward = {
    type: 'text';
    timestamp: number;
    chatId: number;
    message: string;
};

export type Message<M extends keyof Methods = any> = {
    method: M;
    chatId: number;
    message?: string;
    photo?: string;
    options?: Methods[M]['options'];
};

export type Methods = {
    sendMessage: {
        chatId: number;
        message: string;
        options?: SendMessageParams[2];
    };
    sendPhoto: {
        chatId: number;
        photo: string;
        message?: string;
        options?: SendPhotoParams[2];
    };
};
