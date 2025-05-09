type Json = string | number | boolean | null | undefined | { [property: string | number]: Json } | Json[];

type Jsoned<T> = T extends object
    ? { [K in keyof T]: Jsoned<T[K]> }
    : T extends Function | undefined
      ? undefined
      : T extends Date
        ? string
        : T;

type FnReturn<F extends (...args: any) => any> = Awaited<ReturnType<F>>;

type ISOString = string;

type Alert<Tags extends Json = Json, Params extends Json = Json> = {
    type: string;
    tags: Tags;
    timestamp: ISOString;
    resolve: ISOString | null;
    lastAlert: ISOString | null;
    lastTrigger: ISOString;
    params: Params;
    mute: boolean;
    count: number;
};
