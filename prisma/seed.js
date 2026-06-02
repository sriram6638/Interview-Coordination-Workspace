require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Clear existing
  await prisma.interviewSlot.deleteMany();
  await prisma.interview.deleteMany();
  await prisma.user.deleteMany();

  const password = await bcrypt.hash('password123', 10);

  const candidate = await prisma.user.create({
    data: { email: 'candidate@example.com', name: 'Candidate One', password, role: 'candidate' },
  });

  const interviewer = await prisma.user.create({
    data: { email: 'interviewer@example.com', name: 'Interviewer One', password, role: 'interviewer' },
  });

  const interview = await prisma.interview.create({
    data: {
      title: 'Sample Interview',
      description: 'Sample interview created by seed',
      position: 'Software Engineer',
      candidateId: candidate.id,
    },
  });

  const slot = await prisma.interviewSlot.create({
    data: {
      interviewId: interview.id,
      interviewerId: interviewer.id,
      startTime: new Date(Date.now() + 1000 * 60 * 60),
      endTime: new Date(Date.now() + 1000 * 60 * 60 * 2),
      status: 'available',
    },
  });

  // print tokens for testing
  const secret = process.env.NEXTAUTH_SECRET || 'dev-secret-key-change-in-production';
  const tokenCandidate = jwt.sign({ id: candidate.id, email: candidate.email, role: candidate.role }, secret, { expiresIn: '7d' });
  const tokenInterviewer = jwt.sign({ id: interviewer.id, email: interviewer.email, role: interviewer.role }, secret, { expiresIn: '7d' });

  console.log('\nSeed complete. Test accounts:');
  console.log('Candidate:', { email: candidate.email, password: 'password123', token: tokenCandidate });
  console.log('Interviewer:', { email: interviewer.email, password: 'password123', token: tokenInterviewer });
  console.log('Interview ID:', interview.id);
  console.log('Slot ID:', slot.id);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
