import type { Response } from '~/api';

export function success<ResBody extends Json>(response: Response<ResBody>, data?: ResBody, code = 200): void {
    response.status(code).send(data);
}

export function failure(response: Response<any>, error: Json = 'WIP', code = 400): void {
    response.status(code).send(error);
}
