import express from 'express';
import { createVoiceRouter } from './modules/voice/transport/liveCallBridge.js';

export function createApp() {
  const app = express();

  app.use(express.json({ limit: '1mb' }));
  app.use('/voice', createVoiceRouter());

  app.get('/health', (_req, res) => {
    res.json({ ok: true, service: 'senna-2.0' });
  });

  return app;
}
