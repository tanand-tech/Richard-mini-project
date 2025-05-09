import type { Config } from '~/api';

import cors from 'cors';
import config from 'config';
import express from 'express';
import router from './router';
import cookieParser from 'cookie-parser';
import listEndpoints from 'express-list-endpoints';
import http from 'http';
import { Server } from 'socket.io';
import mqtt from '@/services/mqtt';

const { port } = config.get<Config>('api');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
  },
});

io.on('connection', (socket) => {
  console.log('WebSocket client connected');
});

// MQTT -> WebSocket bridge
mqtt.subscribe('sensor/#', (topic, payload) => {
  const data = JSON.parse(payload);
  const { temperature, humidity } = data;
  const deviceId = data.temp_id || data.deviceId;

  const message = {
    deviceId,
    temperature,
    humidity,
    timestamp: Date.now() / 1000,
  };

  console.log('📤 Emitting sensor-data via WebSocket:', message); 

  io.emit('sensor-data', message);
});

// Middleware and routes
app.set('trust proxy', true);
app.use(cors());
app.use(cookieParser());
app.use(express.json({ limit: '1gb' }));
app.use('/', router);

server.listen(port, () => {
  console.table(
    listEndpoints(app)
      .sort(({ path: a }, { path: b }) => (a < b ? -1 : a > b ? 1 : 0))
      .map(({ path, methods }) => ({ path, methods: methods.join(',') }))
  );
});

export default app;