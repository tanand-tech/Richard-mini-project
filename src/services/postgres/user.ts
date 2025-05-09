import type * as pg from '~/postgres';

import * as postgres from './';

export async function user(id: string): Promise<pg.User | undefined> {
    const query = 'select * from "user" where user_id = $1;';

    return (await postgres.query<pg.user>(query, [id])).pop();
}

export async function users(): Promise<pg.User[]> {
    const query = 'select * from "user";';

    return postgres.query<pg.user>(query);
}


