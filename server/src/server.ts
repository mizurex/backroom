import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import http from 'http';
import { env } from './config/env';
import { connectMongo } from './db/mongoose';
import authRoutes from './routes/auth';
import roomRoutes from './routes/room';
import { createSocketServer } from './socket';

async function main() {
  const PORT = process.env.PORT || 3000;
  await connectMongo();

  const app = express();
  app.use(helmet());
  app.use(cors({ origin: env.clientOrigin, credentials: true }));
  app.use(express.json());

  app.get('/api/ping', (_req, res) => res.json({ status: 'ok' }));
  app.use('/api/auth', authRoutes);
  app.use('/api/rooms', roomRoutes);

  const server = http.createServer(app);
  createSocketServer(server);

  server.listen(env.port, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
  });
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});

