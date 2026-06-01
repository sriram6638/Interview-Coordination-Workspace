import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.slice(7);
    const decoded = jwt.verify(
      token,
      process.env.NEXTAUTH_SECRET || 'your-secret-key'
    ) as { id: string };

    const interviews = await prisma.interview.findMany({
      where: {
        candidateId: decoded.id,
      },
    });

    const stats = {
      totalInterviews: interviews.length,
      scheduledInterviews: interviews.filter((i) => i.status === 'scheduled').length,
      completedInterviews: interviews.filter((i) => i.status === 'completed').length,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Dashboard error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
