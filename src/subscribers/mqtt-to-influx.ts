// for storing from mosquitto mqtt to influxdb

import mqtt from '@/services/mqtt';
import { resolveAlert, upsertAlert } from '@/services/postgres/service';
import { write } from '@/services/influx';

mqtt.subscribe('site-a/data/#', async(topic, payload) => {
  try {
    const data: {deviceId: string, temperature: number, humidity: number, timestamp: number} = JSON.parse(payload.toString());
    const { deviceId, temperature, humidity, timestamp } = data;
    const ts = new Date(timestamp * 1000); // Convert to Date


    // Filter out invalid/spike data
    if (data.temperature > 50 || data.temperature < 10 || data.humidity > 100 || data.humidity <20) {
      console.warn(`🚫 Ignored data spike from ${data.deviceId}: temp=${data.temperature}, humidity=${data.humidity}`);
      return;
    }

    console.log(`temp_id: ${deviceId},temperature: ${temperature}, humidity: ${humidity}`)

    write({
      measurement: 'sensor_reading',
      timestamp: ts,
      tags: {deviceId},
      fields: {temperature, humidity},
      precision: 's'
    });

    if (temperature > 25) {
      await upsertAlert(deviceId, 'temperature', ts);
    } else {
      await resolveAlert(deviceId, 'temperature', ts);
    }
  
    // If humidity exceeds 70%, trigger humidity alert
    if (humidity > 70) {
      await upsertAlert(deviceId, 'humidity', ts);
    } else {
      await resolveAlert(deviceId, 'humidity', ts);
    }

  //   await checkAndSaveAlerts(data);
  } catch (err) {
    console.error('MQTT/Ingest Error:', err.message);
    }
});

