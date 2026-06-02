import cors from 'cors';
import dotenv from 'dotenv';
import express, { Request, Response } from 'express';
import { hash, compare } from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from './lib/prisma';
import { getUserFromToken, requireRole } from './lib/auth';
import { createSlotSchema, updateSlotSchema } from './lib/validators';

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 4000);

app.use(cors({ origin: process.env.FRONTEND_URL || '*' }));
app.use(express.json());

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

app.post('/api/auth/register', async (req: Request, res: Response) => {
  try {
    const { email, password, name, role } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(400).json({ error: 'User already exists' });

    const hashedPassword = await hash(password, 10);
    const user = await prisma.user.create({
      data: { email, name, password: hashedPassword, role: role || 'candidate' },
    });

    return res.status(201).json({ success: true, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Missing email or password' });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const passwordMatch = await compare(password, user.password);
    if (!passwordMatch) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.NEXTAUTH_SECRET || 'your-secret-key', { expiresIn: '7d' });
    return res.json({ success: true, token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/users', async (_req: Request, res: Response) => {
  try {
    const interviewers = await prisma.user.findMany({ where: { role: 'interviewer' }, select: { id: true, name: true, email: true } });
    return res.json(interviewers);
  } catch (error) {
    console.error('Fetch users error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/interviews/:id', async (req: Request, res: Response) => {
  try {
    const user = getUserFromToken(req.headers.authorization);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const interview = await prisma.interview.findUnique({ where: { id: req.params.id } });
    if (!interview || interview.candidateId !== user.id) {
      return res.status(404).json({ error: 'Interview not found' });
    }

    return res.json(interview);
  } catch (error) {
    console.error('Fetch interview error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/interviews', async (req: Request, res: Response) => {
  try {
    const user = getUserFromToken(req.headers.authorization);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const interviews = await prisma.interview.findMany({ where: { candidateId: user.id }, orderBy: { createdAt: 'desc' } });
    return res.json(interviews);
  } catch (error) {
    console.error('Fetch interviews error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/interviews', async (req: Request, res: Response) => {
  try {
    const user = getUserFromToken(req.headers.authorization);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const { title, description, position, scheduledAt } = req.body;
    if (!title || !position) return res.status(400).json({ error: 'Missing required fields' });

    const interview = await prisma.interview.create({
      data: { title, description, position, candidateId: user.id, scheduledAt: scheduledAt ? new Date(scheduledAt) : null },
    });

    return res.status(201).json(interview);
  } catch (error) {
    console.error('Create interview error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/dashboard', async (req: Request, res: Response) => {
  try {
    const user = getUserFromToken(req.headers.authorization);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const interviews = await prisma.interview.findMany({ where: { candidateId: user.id } });
    const stats = {
      totalInterviews: interviews.length,
      scheduledInterviews: interviews.filter((interview: { status: string }) => interview.status === 'scheduled').length,
      completedInterviews: interviews.filter((interview: { status: string }) => interview.status === 'completed').length,
    };

    return res.json(stats);
  } catch (error) {
    console.error('Dashboard error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/slots', async (req: Request, res: Response) => {
  try {
    const { interviewId, interviewerId } = req.query;
    const where: any = {};
    if (interviewId) where.interviewId = interviewId;
    if (interviewerId) where.interviewerId = interviewerId;

    const slots = await prisma.interviewSlot.findMany({ where, orderBy: { startTime: 'asc' } });
    return res.json(slots);
  } catch (error) {
    console.error('Fetch slots error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/slots', async (req: Request, res: Response) => {
  try {
    const user = getUserFromToken(req.headers.authorization);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });
    if (!requireRole(user, ['interviewer', 'admin'])) return res.status(403).json({ error: 'Forbidden' });

    const parseResult = createSlotSchema.safeParse(req.body);
    if (!parseResult.success) return res.status(400).json({ error: parseResult.error.errors });

    const { interviewId, interviewerId, startTime, endTime } = parseResult.data;
    const start = new Date(startTime);
    const end = new Date(endTime);
    if (end <= start) return res.status(400).json({ error: 'endTime must be after startTime' });

    const conflict = await prisma.interviewSlot.findFirst({ where: { interviewerId, AND: [{ startTime: { lt: end } }, { endTime: { gt: start } }] } });
    if (conflict) return res.status(409).json({ error: 'Slot conflict with existing slot', conflictId: conflict.id });

    const slot = await prisma.interviewSlot.create({ data: { interviewId, interviewerId, startTime: start, endTime: end, status: 'available' } });
    return res.status(201).json(slot);
  } catch (error) {
    console.error('Create slot error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.patch('/api/slots', async (req: Request, res: Response) => {
  try {
    const user = getUserFromToken(req.headers.authorization);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const parseResult = updateSlotSchema.safeParse(req.body);
    if (!parseResult.success) return res.status(400).json({ error: parseResult.error.errors });

    const { slotId, action } = parseResult.data;
    if (action === 'book') {
      const updated = await prisma.interviewSlot.update({ where: { id: slotId }, data: { status: 'booked' } });
      return res.json(updated);
    }

    if (action === 'cancel') {
      if (!requireRole(user, ['interviewer', 'admin'])) return res.status(403).json({ error: 'Forbidden' });
      const updated = await prisma.interviewSlot.update({ where: { id: slotId }, data: { status: 'available' } });
      return res.json(updated);
    }

    return res.status(400).json({ error: 'Unknown action' });
  } catch (error) {
    console.error('Update slot error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(port, () => {
  console.log(`Interview backend listening on port ${port}`);
});
