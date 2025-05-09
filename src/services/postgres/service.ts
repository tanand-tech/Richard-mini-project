import { Pool } from 'pg';
import config from 'config';

const pool = new Pool(config.get('postgres'));

export async function upsertAlert(sensorId: string, type: string, timestamp: Date): Promise<void> {
  const check = await pool.query(
    `SELECT * FROM alerts WHERE sensor_id = $1 AND alert_type = $2 AND resolved_at IS NULL`,
    [sensorId, type]
  );

  if (check.rowCount === 0) {
    await pool.query(
      `INSERT INTO alerts (sensor_id, alert_type, triggered_at) VALUES ($1, $2, $3)`,
      [sensorId, type, timestamp]
    );
  }
}

export async function resolveAlert(sensorId: string, type: string, timestamp: Date): Promise<void> {
  await pool.query(
    `UPDATE alerts SET resolved_at = $1 WHERE sensor_id = $2 AND alert_type = $3 AND resolved_at IS NULL`,
    [timestamp, sensorId, type]
  );
}
