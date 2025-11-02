import { Router } from 'express';
import bcrypt from 'bcrypt';
import { UserModel } from '../models/User';
import { signToken } from '../utils/jwt';

const router = Router();

router.post('/register', async (req, res) => {
  const { username, password } = req.body as { username?: string; password?: string };
  if (!username || !password) return res.status(400).json({ error: 'username and password required' });
  const exists = await UserModel.findOne({ username });
  
  if (exists) return res.status(409).json({ error: 'username taken' });
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await UserModel.create({ username, passwordHash });
  const token = signToken({ sub: String(user._id), username: user.username });
  return res.json({ token, user: { id: user._id, username: user.username } });
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body as { username?: string; password?: string };
  if (!username || !password) return res.status(400).json({ error: 'username and password required' });
  const user = await UserModel.findOne({ username });
  if (!user) return res.status(401).json({ error: 'username or password incorrect' });
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: 'invalid credentials' });
  const token = signToken({ sub: String(user._id), username: user.username });
  return res.json({ token, user: { id: user._id, username: user.username } });
});

export default router;

