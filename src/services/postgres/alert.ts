import type * as pg from '~/postgres';

import { date } from '@/util';
import * as postgres from './index';
import { query } from 'express';

export async function active<T extends Json = Json, P extends Json = Json>(
    type: string,
    tags: T
): Promise<pg.Alert<T, P> | undefined> {
    const q = `
    select *
    from alerts
    where type = $1
      and tags = $2
      and resolve is null;
    `;
    // @ts-ignore
    return (await postgres.query<pg.alert<T, P>>(q, [type, tags])).pop();
}

export async function alerts(limit: number, offset = 0): Promise<pg.Alert[]> {
    const query = `
    select *
    from alerts
    where resolved_at is not null
    order by resolved_at desc
    limit $1 offset $2;
    `;
    return postgres.query<pg.alert>(query, [limit, offset]);
}

export async function resolve<T extends Json = Json, P extends Json = Json>(
    type: string,
    tags: T,
    timestamp: string = date(new Date())
): Promise<pg.Alert<T, P> | undefined> {
    const query = `
    update alerts
    set resolve      = $3,
        last_trigger = $3
    where type = $1
      and tags = $2
      and resolve is null
    returning *;
    `;
    // @ts-ignore
    return (await postgres.query<pg.alert<T, P>>(query, [type, tags, timestamp])).pop();
}

export async function subscribeAlert(callback: (a: pg.Alert) => any): Promise<void> {
    return postgres.listen<pg.alert>('alert', (a) => callback(postgres.parse(a)));
}

export async function upsert<T extends Json = Json, P extends Json = Json>(
    type: string,
    tags: T,
    timestamp: string,
    // @ts-ignore
    params: P = {}
): Promise<pg.Alert<T, P>> {
    const query = `
    insert into alert (type, tags, timestamp, last_trigger, params)
    values ($1, $2, $3, $3, $4)
    on conflict (type, tags)
    where resolve is null do
    update
    set last_trigger = $3,
        params       = $4,
        count        = alert.count + 1
    returning *;
    `;
    return (await postgres.query<pg.alert<T, P>>(query, [type, tags, timestamp, params]))[0];
}

export async function updateLastAlert<T extends Json = Json, P extends Json = Json>(
    type: string,
    tags: T,
    timestamp: string,
    lastAlertTime = date(new Date())
): Promise<void> {
    const query = `
    update alert
    set last_alert = $4
    where type = $1
      and tags = $2
      and timestamp = $3;
    `;

    await postgres.query(query, [type, tags, timestamp, lastAlertTime]);
}

export async function alertDurationsBySensor(
    alertType: string,
    range: string = '30d'
  ): Promise<Record<string, number>> {
    const query = `
      SELECT sensor_id, SUM(EXTRACT(EPOCH FROM (resolved_at - triggered_at))) AS duration
      FROM alerts
      WHERE alert_type = $1
        AND resolved_at IS NOT NULL
        AND triggered_at >= NOW() - ($2 || '')::interval

      GROUP BY sensor_id;
    `;
  
    const result = await postgres.query<{ sensor_id: string; duration: number }>(query, [
      alertType,
      range,
    ]);
  
    const totalDuration = result.reduce((sum, r) => sum + Number(r.duration), 0);
  
    const pieData: Record<string, number> = {};
    result.forEach((r) => {
      pieData[r.sensorId] = Math.round((Number(r.duration) / totalDuration) * 100);
    });
  
    return pieData;
  }
  
      
    
  
    

  