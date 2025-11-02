import { Server } from 'socket.io';
import type { Socket } from 'socket.io';
import { verifyToken } from './utils/jwt';
import type { Server as HttpServer } from 'http';
import { MessageModel } from './models/Message';
import {createClient} from 'redis';
import { createAdapter } from '@socket.io/redis-adapter';


interface ServerToClientEvents {
  'room:joined': { roomId: string };
  'room:message': { roomId: string; userId: string; username: string; text: string; ts: number };
  'user:joined': { roomId: string; userId: string; username: string };
  'user:left': { roomId: string; userId: string; username: string };
}

interface ClientToServerEvents {
  'room:join': (data: { roomId: string }, ack?: (ok: boolean, err?: string) => void) => void;
  'room:message': (data: { roomId: string; text: string }) => void;
  'room:leave': (data: { roomId: string }, ack?: (ok: boolean, err?: string) => void) => void;
}

interface InterServerEvents {}
interface SocketData { user: { sub: string; username: string } }




export async function createSocketServer(httpServer: HttpServer) {

  const pubClient = createClient({ url: "redis://localhost:6379" });
  const subClient = pubClient.duplicate();

//redis conenction
await pubClient.connect()
console.log("pubClient active", pubClient);
await subClient.connect()



  const io = new Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>(httpServer, {
    cors: { origin: process.env.CLIENT_ORIGIN || '*', credentials: true },
  });

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token
        || (typeof socket.handshake.headers.authorization === 'string' && socket.handshake.headers.authorization.startsWith('Bearer ')
          ? socket.handshake.headers.authorization.slice(7)
          : undefined);
      if (!token) return next(new Error('Unauthorized'));
      const payload = verifyToken(token);
      socket.data.user = { sub: payload.sub, username: payload.username };
      return next();
    } catch (e) {
      return next(new Error('Unauthorized'));
    }
  });

  io.adapter(createAdapter(pubClient, subClient))

  io.on('connection', (socket: Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>) => {
    const { sub: userId, username } = socket.data.user;

    socket.on('room:join', ({ roomId }, ack) => {
      if (!roomId) {
        if (ack) ack(false, 'roomId required');
        return;
      }
      socket.join(roomId);
      (socket as any).emit('room:joined', { roomId });
      (socket.to(roomId) as any).emit('user:joined', { roomId, userId, username });
      if (ack) ack(true);
    });

    socket.on('room:message', async ({ roomId, text }) => {
      if (!roomId || !text) return;
      try {
        await MessageModel.create({ roomId, userId, username, text });
      } catch {}
      (io.to(roomId) as any).emit('room:message', { roomId, userId, username, text, ts: Date.now() });
    });

    socket.on('room:leave', ({ roomId }, ack) => {
      if (!roomId) {
        if (ack) ack(false, 'roomId required');
        return;
      }
      socket.leave(roomId);
      (socket.to(roomId) as any).emit('user:left', { roomId, userId, username });
      if (ack) ack(true);
    });
  });

  return io;
}

