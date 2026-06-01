# Interview Coordination Workspace

A full-stack web application for managing and coordinating interviews efficiently. Built with Next.js, PostgreSQL, and ready for cloud deployment.

## Tech Stack

- **Frontend**: Next.js 14+ (React 18)
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL
- **Authentication**: JWT with bcryptjs
- **Styling**: Tailwind CSS
- **ORM**: Prisma
- **Deployment**: Docker, Google Cloud Platform (GCP)

## Project Structure

```
├── app/
│   ├── api/              # API routes (backend)
│   │   ├── auth/         # Authentication endpoints
│   │   ├── interviews/   # Interview management
│   │   └── dashboard/    # Dashboard stats
│   ├── auth/             # Auth pages
│   ├── interviews/       # Interview pages
│   ├── dashboard/        # Dashboard page
│   ├── page.tsx          # Home page
│   ├── layout.tsx        # Root layout
│   └── globals.css       # Global styles
├── lib/
│   └── prisma.ts         # Prisma client
├── prisma/
│   └── schema.prisma     # Database schema
├── public/               # Static files
├── package.json          # Dependencies
├── next.config.js        # Next.js config
├── tsconfig.json         # TypeScript config
└── Dockerfile            # Docker configuration
```

## Prerequisites

- **Node.js**: 20.x or later
- **npm** or **yarn**
- **PostgreSQL**: 12 or later
- **Docker** (for containerization)
- **Google Cloud Account** (for cloud deployment)

## Quick Start - Local Setup

### 1. Install dependencies

```bash
npm install
# Add missing dependencies
npm install --save bcryptjs jsonwebtoken
npm install --save-dev @types/bcryptjs @types/jsonwebtoken postcss tailwindcss autoprefixer
```

### 2. Set up environment variables

```bash
cp .env.local.example .env.local
# Edit .env.local with your PostgreSQL credentials
```

### 3. Set up PostgreSQL (Option A: Local)

```bash
# Create database
createdb interview_coordination
```

Edit `.env.local`:
```env
DATABASE_URL="postgresql://your_user:your_password@localhost:5432/interview_coordination"
```

### 4. Initialize Prisma & Database

```bash
npx prisma db push
npx prisma generate
```

### 5. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Features

- ✅ User authentication (Sign up / Login)
- ✅ Interview scheduling
- ✅ Interview listing with status tracking
- ✅ Dashboard with statistics  
- ✅ Role-based access (candidate, interviewer)
- ✅ Responsive design with Tailwind CSS

## API Endpoints

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/interviews` - List user's interviews
- `POST /api/interviews` - Create new interview
- `GET /api/dashboard` - Get dashboard statistics

## Deployment to Google Cloud Platform (GCP)

### Prerequisites
- Google Cloud CLI (`gcloud`)
- Docker

### Quick Deploy Steps

```bash
# 1. Set project ID
export PROJECT_ID=your-gcp-project-id
gcloud config set project $PROJECT_ID

# 2. Create Cloud SQL (PostgreSQL)
gcloud sql instances create interview-db \
  --database-version=POSTGRES_15 \
  --tier=db-f1-micro \
  --region=us-central1

# 3. Create database
gcloud sql databases create interview_coordination \
  --instance=interview-db

# 4. Create Cloud Run service
gcloud services enable run.googleapis.com
gcloud auth configure-docker

# 5. Build and push Docker image
docker build -t gcr.io/$PROJECT_ID/interview-coordination .
docker push gcr.io/$PROJECT_ID/interview-coordination

# 6. Deploy to Cloud Run
gcloud run deploy interview-coordination \
  --image=gcr.io/$PROJECT_ID/interview-coordination \
  --platform=managed \
  --region=us-central1 \
  --allow-unauthenticated \
  --memory=512Mi
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:push` - Sync database schema
- `npm run db:studio` - Open Prisma Studio

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `NEXTAUTH_URL` | Application URL |
| `NEXTAUTH_SECRET` | JWT secret key |
| `NEXT_PUBLIC_API_URL` | API base URL |

## Troubleshooting

```bash
# Reset database
npx prisma migrate reset

# Regenerate Prisma Client
npx prisma generate
rm -rf node_modules/.prisma && npm install
```

## License

MIT License

---

**Ready to deploy to the cloud! 🚀**
