# Interview Coordination Workspace

A full-stack web application for managing and coordinating interviews efficiently. Built with Next.js, PostgreSQL, and ready for cloud deployment.

## Tech Stack

- **Frontend**: Next.js 14+ (React 18)
- **Backend**: Express API service in `backend/`
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

## Run with Docker (local)

This repository includes a `Dockerfile.frontend`, `backend/Dockerfile`, and `docker-compose.yml` to run the frontend, backend, and a local PostgreSQL database as separate containers.

1. Build and start services:

```bash
# start frontend, backend, and PostgreSQL together
npm run docker:compose:up
```

2. Seed and prepare the database (once services are healthy):

```bash
npm run docker:seed
```

3. Tail logs / stop services:

```bash
npm run docker:logs    # follow logs
npm run docker:compose:down  # stop and remove containers/volumes
```

Notes:
- Frontend is exposed on port `3000`, backend on port `4000`, and Postgres on port `5432`.
- The frontend container uses `NEXT_PUBLIC_API_URL=http://backend:4000` in Compose so client requests route to the backend container.
- For production builds, build lean images and deploy frontend and backend as separate services.

## Kubernetes Deployment

This repository includes Kubernetes manifests under `k8s/` for local cluster deployment.

1. Build the Docker image locally:

```bash
docker build -t interview-app .
```

2. If you are using `kind`, load the image into the cluster:

```bash
kind load docker-image interview-app:latest
```

3. Create the Kubernetes secret values:

```bash
kubectl apply -f k8s/secret-example.yaml
```

4. Apply Postgres resources:

```bash
kubectl apply -f k8s/postgres-pvc.yaml
kubectl apply -f k8s/postgres-deployment.yaml
kubectl apply -f k8s/postgres-service.yaml
```

5. Apply app resources:

```bash
kubectl apply -f k8s/app-deployment.yaml
kubectl apply -f k8s/app-service.yaml
```

6. Access the app locally:

```bash
kubectl port-forward svc/interview-app 3000:3000
```

The app will then be available at `http://localhost:3000`.

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
