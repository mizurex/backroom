import { Server } from 'socket.io';
import type { Socket } from 'socket.io';
import { verifyToken } from './utils/jwt';
import type { Server as HttpServer } from 'http';
import { MessageModel } from './models/Message';
import { RoomModel } from './models/Room';


interface ServerToClientEvents {
  'room:joined': { roomId: string };
  'room:message': { roomId: string; userId: string; username: string; text: string; ts: number };
  'user:joined': { roomId: string; userId: string; username: string };
  'user:left': { roomId: string; userId: string; username: string };
  'user:typing': { roomId: string; userId: string; username: string; isTyping: boolean };
  'user:kicked': { roomId: string; reason?: string };
}

interface ClientToServerEvents {
  'room:join': (data: { roomId: string }, ack?: (ok: boolean, err?: string) => void) => void;
  'room:message': (data: { roomId: string; text: string }) => void;
  'room:leave': (data: { roomId: string }, ack?: (ok: boolean, err?: string) => void) => void;
  'room:typing': (data: { roomId: string; isTyping: boolean }) => void;
  'room:kick': (data: { roomId: string; targetUserId: string }, ack?: (ok: boolean, err?: string) => void) => void;
  'room:members': (data: { roomId: string }, ack: (resp: { ownerId: string; members: { userId: string; username: string }[] } | null, err?: string) => void) => void;
}

interface InterServerEvents {}
interface SocketData { user: { sub: string; username: string } }




export async function createSocketServer(httpServer: HttpServer) {





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

  io.on('connection', (socket: Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>) => {
    const { sub: userId, username } = socket.data.user;

    // join a personal room for targeted operations (kicks, DM, etc.)
    socket.join(userId);

    socket.on('room:join', ({ roomId }, ack) => {
      if (!roomId) {
        if (ack) ack(false, 'roomId required');
        return;
      }
      // verify membership in DB (prevents rejoining after kick)
      RoomModel.findOne({ roomId }).then(room => {
        if (!room) {
          if (ack) ack(false, 'room not found');
          return;
        }
        const isMember = room.members.some(m => String(m) === userId);
        if (!isMember) {
          if (ack) ack(false, 'forbidden');
          return;
        }
        socket.join(roomId);
        (socket as any).emit('room:joined', { roomId });
        (socket.to(roomId) as any).emit('user:joined', { roomId, userId, username });
        if (ack) ack(true);
      }).catch(() => {
        if (ack) ack(false, 'error');
      });
    });

    socket.on('room:message', async ({ roomId, text }) => {
      if (!roomId || !text) return;
      try {
        await MessageModel.create({ roomId, userId, username, text });
        // bump room activity so TTL extends 4h from last message
        await RoomModel.updateOne({ roomId }, { $set: { updatedAt: new Date() } }).catch(() => {});
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

    socket.on('room:typing', ({ roomId, isTyping }) => {
      if (!roomId) return;
      (socket.to(roomId) as any).emit('user:typing', { roomId, userId, username, isTyping });
    });

    socket.on('room:kick', async ({ roomId, targetUserId }, ack) => {
      try {
        if (!roomId || !targetUserId) {
          if (ack) ack(false, 'roomId and targetUserId required');
          return;
        }
        const room = await RoomModel.findOne({ roomId });
        if (!room) {
          if (ack) ack(false, 'room not found');
          return;
        }
        // only owner can kick
        if (String(room.owner) !== userId) {
          if (ack) ack(false, 'forbidden');
          return;
        }
        // Remove from DB membership if present
        const before = room.members.length;
        room.members = room.members.filter(m => String(m) !== targetUserId);
        if (room.members.length !== before) await room.save();

        // Remove all of target user's sockets from the room, and notify them
         io.in(targetUserId).socketsLeave(roomId);
        (io.to(targetUserId) as any).emit('user:kicked', { roomId, reason: 'kicked by admin' });
        (socket.to(roomId) as any).emit('user:left', { roomId, userId: targetUserId, username: 'user' });
        if (ack) ack(true);
      } catch (e) {
        if (ack) ack(false, 'error');
      }
    });

    socket.on('room:members', async ({ roomId }, ack) => {
      try {
        if (!roomId) return ack(null, 'roomId required');
        const room = await RoomModel.findOne({ roomId });
        if (!room) return ack(null, 'room not found');
        const sockets = await io.in(roomId).fetchSockets();
        const members = sockets.map(s => {
          const d: any = (s as any).data;
          return { userId: d?.user?.sub, username: d?.user?.username };
        }).filter(m => m.userId);
        ack({ ownerId: String(room.owner), members });
      } catch (e) {
        ack(null, 'error');
      }
    });
  });

  return io;
}

