# Interview Coordination Workspace - Quick Start Guide

Get up and running in 5 minutes!

## Option 1: Simple Local Setup (Recommended for Beginners)

### Step 1: Install Dependencies

```bash
cd Interview-Coordination-Workspace
npm install
npm install --save bcryptjs jsonwebtoken
npm install --save-dev @types/bcryptjs @types/jsonwebtoken tailwindcss autoprefixer
```

### Step 2: Set Up Database

You'll need PostgreSQL. Choose one:

**A) Using Homebrew (macOS)**
```bash
brew install postgresql
brew services start postgresql
createdb interview_coordination
```

**B) Using Docker**
```bash
docker run -d \
  --name interview-db \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=interview_coordination \
  -p 5432:5432 \
  postgres:15-alpine
```

### Step 3: Configure Environment

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:
```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/interview_coordination"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"
NEXT_PUBLIC_API_URL="http://localhost:3000"
```

### Step 4: Initialize Database

```bash
npx prisma db push
npx prisma generate
```

### Step 5: Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

---

## Option 2: Docker Compose (All-in-One)

```bash
# Start everything with one command
docker-compose up

# Wait for services to be ready (about 30 seconds)
```

Open [http://localhost:3000](http://localhost:3000)

To stop:
```bash
docker-compose down
```

---

## Option 3: Cloud Deployment (GCP)

See [GCP-DEPLOYMENT.md](./GCP-DEPLOYMENT.md) for detailed instructions.

Quick version:
```bash
# Set up GCP project
export PROJECT_ID=my-interview-app
gcloud config set project $PROJECT_ID

# Create database
gcloud sql instances create interview-db \
  --database-version=POSTGRES_15 \
  --tier=db-f1-micro \
  --region=us-central1

# Build and deploy
docker build -t gcr.io/$PROJECT_ID/interview-coordination .
docker push gcr.io/$PROJECT_ID/interview-coordination

gcloud run deploy interview-coordination \
  --image=gcr.io/$PROJECT_ID/interview-coordination \
  --region=us-central1 \
  --allow-unauthenticated
```

---

## Testing the Application

### Sign Up & Login

1. Go to http://localhost:3000
2. Click "Sign Up"
3. Create an account (e.g., email: `test@example.com`, password: `password123`)
4. You're logged in! 🎉

### Create an Interview

1. Click "Interviews" from dashboard
2. Click "Create Interview"
3. Fill in:
   - Title: "Senior Engineer Interview"
   - Position: "Senior Software Engineer"
   - Description: "First round interviews"
   - Scheduled Date: Pick a date
4. Click "Schedule Interview"

### View Dashboard

1. Navigate to "/dashboard"
2. See stats:
   - Total Interviews
   - Scheduled Interviews
   - Completed Interviews

---

## Common Commands

```bash
# Development
npm run dev                 # Start dev server
npm run build              # Build for production
npm start                  # Start production server

# Database
npm run db:push            # Sync database schema
npm run db:studio          # Open Prisma Studio (UI for database)

# Code quality
npm run lint               # Check for linting errors
```

---

## Troubleshooting

### "Database connection failed"

```bash
# Check PostgreSQL is running
psql --version

# On macOS
brew services list | grep postgres

# Test connection
psql -U postgres -d interview_coordination
```

### "Port 3000 already in use"

```bash
# macOS/Linux
lsof -ti:3000 | xargs kill -9

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### "Prisma Client not found"

```bash
rm -rf node_modules/.prisma
npx prisma generate
npm install
```

---

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── api/               # API routes (backend)
│   ├── auth/              # Login/signup pages
│   ├── interviews/        # Interview pages
│   └── dashboard/         # Dashboard page
├── lib/                   # Utilities
│   └── prisma.ts         # Database client
├── prisma/               # Database
│   └── schema.prisma     # Data model
├── .env.local.example    # Environment template
├── package.json          # Dependencies
├── Dockerfile            # Container image
└── docker-compose.yml    # Docker setup
```

---

## API Endpoints Quick Reference

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST   | `/api/auth/register` | Create account |
| POST   | `/api/auth/login` | Login |
| GET    | `/api/interviews` | List interviews |
| POST   | `/api/interviews` | Create interview |
| GET    | `/api/dashboard` | Get stats |

---

## Need Help?

1. **Local Setup Issues**: Check PostgreSQL is running
2. **Build Errors**: Try `npm install` and `npm run build`
3. **Database Issues**: Run `npx prisma db push` and `npx prisma generate`
4. **Port Conflicts**: Kill other processes on port 3000 or 5432

---

## Next Steps

1. ✅ Run locally
2. Read [GCP-DEPLOYMENT.md](./GCP-DEPLOYMENT.md) for cloud hosting
3. Explore the code in `app/` directory
4. Customize features for your needs
5. Deploy to production!

---

**Happy building! 🚀**

For detailed documentation, see [README.md](./README.md)
