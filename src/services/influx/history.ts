import { bucket, buildFluxRange, query } from './index'; 


type ChartPoint = {
  timestamp: number;
  temperature: number | null;
  humidity: number | null;
};

function getWindowInterval(range?: string): string {
  switch (range) {
    case '1h': return '1m';
    case '1d': return '10m';
    case '7d': return '1h';
    case '30d': return '1d';
    case '365d': return '7d';
    default: return '1h'; // fallback
  }
}


export async function getHistoricalChartData(
  range?: string,
  start?: string,
  end?: string
): Promise<Record<string, ChartPoint[]>> {
  const fluxRange = buildFluxRange(range, start, end);
  const windowInterval = getWindowInterval(range); // ⬅️ determine window

  const fluxQuery = `
    from(bucket: "${bucket}")
      ${fluxRange}
      |> filter(fn: (r) => r._measurement == "sensor_reading")
      |> filter(fn: (r) => r._field == "temperature" or r._field == "humidity")
      |> aggregateWindow(every: ${windowInterval}, fn: mean, createEmpty: false)
      |> pivot(rowKey:["_time"], columnKey: ["_field"], valueColumn: "_value")
      |> group(columns: ["deviceId"])
      |> sort(columns: ["_time"])
  `;

  const rows = await query<{
    deviceId: string;
    _time: string;
    temperature?: number;
    humidity?: number;
  }>(fluxQuery);

  const result: Record<string, ChartPoint[]> = {};

  rows.forEach((r) => {
    const timestamp = new Date(r._time).getTime() / 1000;
    if (!result[r.deviceId]) result[r.deviceId] = [];
    result[r.deviceId].push({
      timestamp,
      temperature: r.temperature ?? null,
      humidity: r.humidity ?? null,
    });
  });

  return result;
}


export async function getRealtimeChartData(field?: 'temperature' | 'humidity'): Promise<Record<string, ChartPoint[]>> {
  const fieldFilter = field
    ? `|> filter(fn: (r) => r._field == "${field}")`
    : `|> filter(fn: (r) => r._field == "temperature" or r._field == "humidity")`;

  const fluxQuery = `
    from(bucket: "${bucket}")
      |> range(start: -1h)
      |> filter(fn: (r) => r._measurement == "sensor_reading")
      ${fieldFilter}
      |> pivot(rowKey:["_time"], columnKey: ["_field"], valueColumn: "_value")
      |> group(columns: ["deviceId"])
      |> sort(columns: ["_time"], desc: true)
      |> limit(n: 50)
  `;

  const rows = await query<{
    deviceId: string;
    _time: string;
    temperature?: number;
    humidity?: number;
  }>(fluxQuery);

  const result: Record<string, ChartPoint[]> = {};

  rows.forEach((r) => {
    const timestamp = new Date(r._time).getTime() / 1000;
    if (!result[r.deviceId]) result[r.deviceId] = [];
    result[r.deviceId].unshift({
      timestamp,
      temperature: r.temperature ?? null,
      humidity: r.humidity ?? null,
    });
  });

  return result;
}

