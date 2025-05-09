import type e from 'express';
import type { ParamsDictionary, Query, RouteParameters } from 'express-serve-static-core';

export type Config = {
    port: number;
    origin?: string;
};

export interface Request<
    Params extends ParamsDictionary | undefined = undefined,
    ResBody extends Json = undefined,
    ReqBody extends Json | undefined = undefined,
    ReqQuery extends Query | undefined = undefined,
    Locals extends Record<string, any> = Record<string, any>,
> extends e.Request<Params, ResBody, ReqBody, ReqQuery, Locals> {}

export interface Response<ResBody extends Json = undefined> extends e.Response<ResBody> {}

export type Controller<
    Route extends string = '/',
    ResBody extends Json = undefined,
    ReqBody extends Json | undefined = undefined,
    ReqQuery extends Query = Query,
    Locals extends Record<string, any> = Record<string, any>,
> = (
    request: Request<RouteParameters<Route>, ResBody, ReqBody, ReqQuery, Locals>,
    response: Response<ResBody>,
    next?: e.NextFunction
) => Promise<any>;
