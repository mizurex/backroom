import { Router } from 'express';
import { randomUUID } from 'crypto';
import { authenticate, AuthedRequest } from '../middleware/auth';
import { RoomModel } from '../models/Room';
import { Types } from 'mongoose';
import { MessageModel } from '../models/Message';

const router = Router();

router.post('/', authenticate, async (req: AuthedRequest, res) => {
  const userId = req.user!.sub;
  const roomId = (typeof randomUUID === 'function') ? randomUUID() : Math.random().toString(36).slice(2, 10);
  const owner = new Types.ObjectId(userId);
  const room = await RoomModel.create({ roomId, owner, members: [owner] });
  return res.json({ roomId: room.roomId });
});

router.post('/join', authenticate, async (req: AuthedRequest, res) => {
  const { roomId } = req.body as { roomId?: string };
  if (!roomId) return res.status(400).json({ error: 'roomId required' });
  const userId = req.user!.sub;
  const userObjId = new Types.ObjectId(userId);
  const room = await RoomModel.findOne({ roomId });
  if (!room) return res.status(404).json({ error: 'room not found' });
  const isMember = room.members.some(m => m.equals(userObjId));
  if (!isMember) {
    room.members.push(userObjId);
    await room.save();
  }
  return res.json({ roomId: room.roomId });
});

router.post('/leave', authenticate, async (req: AuthedRequest, res) => {
  const { roomId } = req.body as { roomId?: string };
  if (!roomId) return res.status(400).json({ error: 'roomId required' });
  const userId = req.user!.sub;
  const userObjId = new Types.ObjectId(userId);
  const room = await RoomModel.findOne({ roomId });
  if (!room) return res.status(404).json({ error: 'room not found' });
  const before = room.members.length;
  room.members = room.members.filter(m => !m.equals(userObjId));
  if (room.members.length !== before) await room.save();
  return res.json({ roomId: room.roomId });
});

router.get('/:roomId/messages', authenticate, async (req: AuthedRequest, res) => {
  const { roomId } = req.params as { roomId: string };
  const limit = Math.min(Number(req.query.limit) || 50, 200);
  const messages = await MessageModel.find({ roomId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
  return res.json({ messages: messages.reverse() });
});

export default router;

