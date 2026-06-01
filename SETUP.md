# Setup Instructions - Interview Coordination Workspace

## 📋 What You've Got

A complete, production-ready web application with:

✅ **Next.js 14** - Full-stack React framework  
✅ **PostgreSQL** - Robust relational database  
✅ **Authentication** - JWT-based user auth with bcryptjs  
✅ **Interview Management** - Schedule, list, and track interviews  
✅ **Dashboard** - Real-time statistics and overview  
✅ **Tailwind CSS** - Beautiful, responsive UI  
✅ **Docker Support** - Ready for containerization  
✅ **GCP Ready** - Deployment configurations included  

## 🚀 Quick Start (Choose One)

### Option 1: Local Development (Fastest)

```bash
# 1. Install dependencies
npm install
npm install --save bcryptjs jsonwebtoken
npm install --save-dev @types/bcryptjs @types/jsonwebtoken tailwindcss autoprefixer

# 2. Start PostgreSQL (choose method A or B)
# Method A: Docker
docker run -d --name interview-db -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=interview_coordination -p 5432:5432 postgres:15-alpine

# Method B: Homebrew (macOS)
# brew install postgresql && brew services start postgresql && createdb interview_coordination

# 3. Configure environment
cp .env.local.example .env.local
# Edit .env.local with your DB credentials

# 4. Set up database
npx prisma db push

# 5. Start dev server
npm run dev
```

✨ **Your app is running at http://localhost:3000**

### Option 2: Docker Compose (Everything in One Command)

```bash
# Start everything
docker-compose up

# Wait ~30 seconds for services to be ready

# Open http://localhost:3000
```

### Option 3: Deploy to GCP Now

See [GCP-DEPLOYMENT.md](./GCP-DEPLOYMENT.md)

## 📚 Documentation

- **[QUICKSTART.md](./QUICKSTART.md)** - Fast setup guide
- **[README.md](./README.md)** - Complete documentation
- **[GCP-DEPLOYMENT.md](./GCP-DEPLOYMENT.md)** - Cloud deployment steps

## 🎯 First Time User Flow

### 1. **Sign Up**
- Go to http://localhost:3000
- Click "Sign Up"
- Create account (any email/password)

### 2. **Explore Dashboard**
- View statistics panel
- See "Total Interviews" counter

### 3. **Create Interview**
- Click "Schedule New Interview"
- Fill in interview details
- Set date/time
- Click "Schedule Interview"

### 4. **View Interviews**
- Go to "Interviews" section
- See your created interview
- View status badges

## 🛠️ Key Commands

```bash
npm run dev              # Start development server
npm run build            # Build for production
npm run db:push          # Sync database
npm run db:studio        # Open database UI
npm run lint             # Check code
npm start                # Start production
```

## 🔐 Default Environment Setup

`.env.local.example` includes:

```
DATABASE_URL="postgresql://..."  # PostgreSQL connection
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"
NEXT_PUBLIC_API_URL="http://localhost:3000"
```

## 📁 Project Structure

```
app/
├── api/                    # API routes (backend)
│   ├── auth/register       # Sign up
│   ├── auth/login          # Login
│   ├── interviews/         # Interview CRUD
│   └── dashboard/          # Stats
├── auth/                   # Auth pages
│   ├── login/page.tsx
│   └── register/page.tsx
├── interviews/             # Interview pages
│   ├── page.tsx
│   └── create/page.tsx
├── dashboard/page.tsx      # Dashboard
└── page.tsx               # Home

lib/
└── prisma.ts              # Database client

prisma/
└── schema.prisma          # Database schema
```

## 🔄 Database Schema

### Users
- id, email, name, password, role
- Roles: candidate, interviewer, admin

### Interviews
- id, title, position, description
- status (scheduled, in-progress, completed, cancelled)
- candidateId, scheduledAt

### InterviewSlots
- id, interviewId, interviewerId
- startTime, endTime, status

## 🌐 API Endpoints

```
POST   /api/auth/register       → Register new user
POST   /api/auth/login          → Login & get JWT token
GET    /api/interviews          → List user's interviews
POST   /api/interviews          → Create interview
GET    /api/dashboard           → Get stats
```

## 🐛 Troubleshooting

**Database connection error?**
```bash
# Check PostgreSQL is running
psql -U postgres -d interview_coordination

# If not running:
docker start interview-db  # or brew services start postgresql
```

**Port 3000 already in use?**
```bash
# macOS/Linux
lsof -ti:3000 | xargs kill -9

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

**Prisma errors?**
```bash
npx prisma generate
npm install
npx prisma db push
```

## ☁️ Next: Deploy to Cloud

When ready to go live:

1. Read [GCP-DEPLOYMENT.md](./GCP-DEPLOYMENT.md)
2. Set up GCP project
3. Create Cloud SQL database
4. Build & push Docker image
5. Deploy to Cloud Run

## ✨ Feature Roadmap

Current:
- ✅ User authentication
- ✅ Interview scheduling
- ✅ Dashboard

Future enhancements:
- [ ] Email notifications
- [ ] Video conferencing integration
- [ ] Interview templates
- [ ] Interviewer feedback forms
- [ ] Real-time notifications
- [ ] Export reports

## 📖 Learning Resources

- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [PostgreSQL Docs](https://www.postgresql.org/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [GCP Documentation](https://cloud.google.com/docs)

## 🎓 What You Can Learn

This project demonstrates:
- Full-stack web development
- RESTful API design
- Database design & optimization
- Authentication & security
- Docker containerization
- Cloud deployment (GCP)
- TypeScript best practices
- React hooks & components
- TailwindCSS styling

## 💡 Tips

1. **Development Speed**: Use `npm run dev` for hot reload
2. **Database Visual**: Run `npm run db:studio` to see data
3. **Type Safety**: TypeScript catches errors early
4. **Environment**: Never commit `.env.local` - use `.env.local.example`
5. **Database**: Always test migrations in development first

## 🚀 You're All Set!

```bash
# Run this NOW
npm run dev

# Then open http://localhost:3000
```

---

**Start building! Questions?** Check the documentation files listed above.
