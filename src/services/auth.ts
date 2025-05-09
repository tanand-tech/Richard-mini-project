import type { Config } from '~/auth';

import config from 'config';
import jwt from 'jsonwebtoken';

const { project, privateKey, publicKey } = config.get<Config>('auth');

export { project };

export function sign<T extends Record<string, Json>>(data?: T, options?: Omit<jwt.SignOptions, 'algorithm'>): string {
    return jwt.sign({ project, ...data }, privateKey, { algorithm: 'RS256', ...options });
}

export function verify(token: string, options?: jwt.VerifyOptions): string | jwt.Jwt | jwt.JwtPayload {
    return jwt.verify(token, publicKey, { algorithms: ['RS256'], ...options });
}
