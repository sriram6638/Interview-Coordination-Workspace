# GCP Deployment Guide

This guide walks you through deploying the Interview Coordination Workspace to Google Cloud Platform.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Setting up GCP](#setting-up-gcp)
3. [Database Setup (Cloud SQL)](#database-setup-cloud-sql)
4. [Docker Image Creation](#docker-image-creation)
5. [Deployment to Cloud Run](#deployment-to-cloud-run)
6. [Post-Deployment](#post-deployment)
7. [Troubleshooting](#troubleshooting)

## Prerequisites

- Google Cloud Account with billing enabled
- Google Cloud CLI (`gcloud`) installed and configured
- Docker installed locally
- Node.js 20.x installed

## Setting up GCP

### 1. Create a GCP Project

```bash
# Create project
gcloud projects create interview-coordination --name="Interview Coordination"

# Set as default project
export PROJECT_ID=interview-coordination
gcloud config set project $PROJECT_ID

# Enable required APIs
gcloud services enable \
  run.googleapis.com \
  sql-component.googleapis.com \
  cloudbuild.googleapis.com \
  containerregistry.googleapis.com \
  compute.googleapis.com
```

### 2. Configure Authentication

```bash
# Authenticate with Google Cloud
gcloud auth login

# Set up Docker authentication
gcloud auth configure-docker
```

## Database Setup (Cloud SQL)

### 1. Create PostgreSQL Instance

```bash
gcloud sql instances create interview-db \
  --database-version=POSTGRES_15 \
  --tier=db-f1-micro \
  --region=us-central1 \
  --availability-type=regional \
  --enable-bin-log \
  --backup-start-time=03:00
```

### 2. Create Database and User

```bash
# Create database
gcloud sql databases create interview_coordination \
  --instance=interview-db

# Set root password
gcloud sql users set-password postgres \
  --instance=interview-db \
  --password

# OR create new user
gcloud sql users create dbuser \
  --instance=interview-db \
  --password
```

### 3. Get Connection Information

```bash
# Get connection name (needed for Cloud Run)
gcloud sql instances describe interview-db \
  --format='value(connectionName)'

# Get public IP (if needed for local testing)
gcloud sql instances describe interview-db \
  --format='value(ipAddresses[0].ipAddress)'
```

## Docker Image Creation

### 1. Build Docker Image

```bash
# From project root directory
docker build -t gcr.io/$PROJECT_ID/interview-coordination:latest .
```

### 2. Test Image Locally (Optional)

```bash
docker run -e DATABASE_URL="..." \
  -e NEXTAUTH_SECRET="test-secret" \
  -e NEXTAUTH_URL="http://localhost:3000" \
  -p 3000:3000 \
  gcr.io/$PROJECT_ID/interview-coordination:latest
```

### 3. Push Image to Google Container Registry

```bash
docker push gcr.io/$PROJECT_ID/interview-coordination:latest
```

## Deployment to Cloud Run

### 1. Prepare Environment Variables

```bash
# Get Cloud SQL connection name
CONNECTION_NAME=$(gcloud sql instances describe interview-db --format='value(connectionName)')
echo $CONNECTION_NAME

# Generate secure secret
NEXTAUTH_SECRET=$(openssl rand -base64 32)
echo $NEXTAUTH_SECRET
```

### 2. Deploy to Cloud Run

```bash
gcloud run deploy interview-coordination \
  --image=gcr.io/$PROJECT_ID/interview-coordination:latest \
  --platform=managed \
  --region=us-central1 \
  --allow-unauthenticated \
  --memory=512Mi \
  --cpu=1 \
  --timeout=3600s \
  --max-instances=100 \
  --set-env-vars=\
NODE_ENV=production,\
DATABASE_URL="postgresql://dbuser:PASSWORD@/interview_coordination?host=/cloudsql/$CONNECTION_NAME",\
NEXTAUTH_SECRET=$NEXTAUTH_SECRET,\
NEXTAUTH_URL="https://YOUR_CLOUD_RUN_URL",\
NEXT_PUBLIC_API_URL="https://YOUR_CLOUD_RUN_URL" \
  --add-cloudsql-instances=$CONNECTION_NAME \
  --service-account=cloud-run-sa@$PROJECT_ID.iam.gserviceaccount.com
```

### 3. Get Cloud Run URL

```bash
gcloud run services describe interview-coordination \
  --region=us-central1 \
  --format='value(status.url)'
```

## Post-Deployment

### 1. Update Environment Variables

```bash
# Get Cloud Run URL
CLOUD_RUN_URL=$(gcloud run services describe interview-coordination \
  --region=us-central1 \
  --format='value(status.url)')

# Update environment variables with actual URL
gcloud run services update interview-coordination \
  --update-env-vars=NEXTAUTH_URL=$CLOUD_RUN_URL,\
NEXT_PUBLIC_API_URL=$CLOUD_RUN_URL \
  --region=us-central1
```

### 2. Run Database Migrations

```bash
# Create a Cloud Run job for migrations (if using Prisma)
gcloud run jobs create interview-db-migrate \
  --image=gcr.io/$PROJECT_ID/interview-coordination:latest \
  --set-env-vars=\
DATABASE_URL="postgresql://dbuser:PASSWORD@/interview_coordination?host=/cloudsql/$CONNECTION_NAME" \
  --add-cloudsql-instances=$CONNECTION_NAME \
  --command=npx \
  --args=prisma,db,push

# Execute the job
gcloud run jobs execute interview-db-migrate --region=us-central1
```

### 3. Verify Deployment

```bash
# Check Cloud Run service status
gcloud run services describe interview-coordination --region=us-central1

# Check logs
gcloud run services logs read interview-coordination --region=us-central1 --limit=50

# Test the service
curl $(gcloud run services describe interview-coordination \
  --region=us-central1 \
  --format='value(status.url)')
```

## Monitoring and Management

### 1. View Logs

```bash
# Real-time logs
gcloud run services logs read interview-coordination \
  --region=us-central1 \
  --follow

# With filters
gcloud run services logs read interview-coordination \
  --region=us-central1 \
  --limit=100
```

### 2. View Metrics

```bash
# Via Cloud Console
# https://console.cloud.google.com/run
```

### 3. Update Deployment

```bash
# Deploy new version
docker build -t gcr.io/$PROJECT_ID/interview-coordination:latest .
docker push gcr.io/$PROJECT_ID/interview-coordination:latest

gcloud run deploy interview-coordination \
  --image=gcr.io/$PROJECT_ID/interview-coordination:latest \
  --region=us-central1
```

## Troubleshooting

### Problem: Cloud Run Service Not Starting

```bash
# Check logs
gcloud run services logs read interview-coordination --region=us-central1 --limit=100

# Common issues:
# 1. Database connection: Verify DATABASE_URL and Cloud SQL instance permissions
# 2. Memory: Increase memory allocation
# 3. Environment variables: Check all required variables are set
```

### Problem: Database Connection Failed

```bash
# Verify Cloud SQL instance
gcloud sql instances list

# Check connections
gcloud sql instances describe interview-db

# Update Cloud Run service with correct connection
gcloud run services update interview-coordination \
  --add-cloudsql-instances=$CONNECTION_NAME \
  --region=us-central1
```

### Problem: High Memory Usage

```bash
# Increase memory
gcloud run deploy interview-coordination \
  --memory=1Gi \
  --region=us-central1
```

### Problem: Slow Response Times

```bash
# Check Cloud SQL metrics
gcloud sql instances describe interview-db

# Increase Cloud Run CPU
gcloud run deploy interview-coordination \
  --cpu=2 \
  --region=us-central1
```

## Cost Optimization

### 1. Reduce Always-On Instance

```bash
# Set min instances to 0 to save cost
gcloud run deploy interview-coordination \
  --region=us-central1 \
  # Note: min-instances is not directly available in gcloud run deploy
  # Use Cloud Console to set this
```

### 2. Optimize Database

- Use `db-f1-micro` tier during development
- Enable automatic backups during production
- Monitor query performance

### 3. Enable Cloud CDN (Optional)

```bash
# Create a backend service with CDN enabled for static assets
```

## Cleanup

```bash
# Delete Cloud Run service
gcloud run services delete interview-coordination --region=us-central1

# Delete Cloud SQL instance
gcloud sql instances delete interview-db

# Delete container image
gcloud container images delete gcr.io/$PROJECT_ID/interview-coordination

# Delete GCP Project (if cleaning up completely)
gcloud projects delete $PROJECT_ID
```

## Next Steps

1. Configure custom domain (optional)
2. Set up CI/CD pipeline with Cloud Build
3. Add monitoring and alerting
4. Implement database backup strategy
5. Set up SSL/TLS certificates

---

For more information, visit the [Google Cloud Documentation](https://cloud.google.com/docs).
