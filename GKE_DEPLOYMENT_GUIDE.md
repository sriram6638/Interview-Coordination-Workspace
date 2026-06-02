# Step-by-Step Guide: Deploy Interview Coordination App to GKE

## Prerequisites
- GCP account (free tier is fine)
- Google Cloud SDK installed (`gcloud`)
- Terraform installed
- kubectl installed
- Docker installed
- GitHub account with your code repository

---

## Step 1: Set Up GCP Project

### 1.1 Create a GCP Project
```bash
# Create a new project (replace YOUR_PROJECT_ID with your desired name)
gcloud projects create interview-coordination-app --name="Interview Coordination App"

# Get your project ID
gcloud config list --format='value(core.project)'
```

### 1.2 Set the Project as Active
```bash
export PROJECT_ID="your-gcp-project-id"
gcloud config set project $PROJECT_ID
```

### 1.3 Enable Required APIs
```bash
gcloud services enable \
  container.googleapis.com \
  artifactregistry.googleapis.com \
  sqladmin.googleapis.com \
  compute.googleapis.com \
  cloudresourcemanager.googleapis.com \
  iam.googleapis.com \
  serviceusage.googleapis.com
```

---

## Step 2: Create a Service Account for Terraform

### 2.1 Create Service Account
```bash
gcloud iam service-accounts create terraform-sa \
  --display-name="Terraform Service Account" \
  --project=$PROJECT_ID
```

### 2.2 Grant Required Permissions
```bash
# Get service account email
export SA_EMAIL=$(gcloud iam service-accounts list \
  --filter="displayName:Terraform" \
  --format='value(email)')

# Grant necessary roles
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member=serviceAccount:$SA_EMAIL \
  --role=roles/container.admin

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member=serviceAccount:$SA_EMAIL \
  --role=roles/cloudsql.admin

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member=serviceAccount:$SA_EMAIL \
  --role=roles/compute.networkAdmin

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member=serviceAccount:$SA_EMAIL \
  --role=roles/iam.serviceAccountAdmin

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member=serviceAccount:$SA_EMAIL \
  --role=roles/artifactregistry.admin
```

### 2.3 Create and Download Credentials
```bash
# Create a JSON key
gcloud iam service-accounts keys create credentials.json \
  --iam-account=$SA_EMAIL

# Store this securely - you'll need it for Terraform and GitHub Actions
cat credentials.json
```

---

## Step 3: Provision Infrastructure with Terraform

### 3.1 Prepare Terraform Variables
```bash
cd terraform

# Copy and edit the example file
cp terraform.tfvars.example terraform.tfvars

# Edit terraform.tfvars with your values
nano terraform.tfvars
```

**terraform.tfvars:**
```hcl
project_id   = "your-gcp-project-id"
region       = "us-central1"
cluster_name = "interview-coordination-cluster"
num_nodes    = 1
```

### 3.2 Set Credentials for Terraform
```bash
export GOOGLE_APPLICATION_CREDENTIALS=$(pwd)/../credentials.json
```

### 3.3 Initialize and Apply Terraform
```bash
# Initialize Terraform
terraform init

# Validate configuration
terraform validate

# Plan the deployment (see what will be created)
terraform plan

# Apply the configuration (create GKE, CloudSQL, etc.)
terraform apply

# Save outputs
terraform output > ../gke_outputs.txt
```

**What gets created:**
- GKE Cluster (1 node, e2-medium machine type)
- VPC & Subnet
- Cloud SQL PostgreSQL instance
- Artifact Registry for Docker images
- Kubernetes secrets for database credentials

### 3.4 Get Important Outputs
```bash
# These are needed for GitHub Actions
terraform output artifact_registry_url
terraform output cloud_sql_instance_connection_name
terraform output kubernetes_cluster_name
```

---

## Step 4: Set Up GitHub Actions Secrets

### 4.1 Create Workload Identity Federation (for GitHub Actions)

This allows GitHub Actions to authenticate to GCP securely without storing credentials.

```bash
# Create workload identity pool
gcloud iam workload-identity-pools create "github-pool" \
  --project=$PROJECT_ID \
  --location=global \
  --display-name="GitHub Actions"

# Create workload identity provider
gcloud iam workload-identity-pools providers create-oidc "github-provider" \
  --project=$PROJECT_ID \
  --location=global \
  --workload-identity-pool="github-pool" \
  --display-name="GitHub provider" \
  --attribute-mapping="google.subject=assertion.sub,attribute.actor=assertion.actor,attribute.environment=assertion.environment,attribute.repository=assertion.repository" \
  --issuer-uri="https://token.actions.githubusercontent.com"

# Create service account for GitHub Actions
gcloud iam service-accounts create github-actions-sa \
  --display-name="GitHub Actions Service Account" \
  --project=$PROJECT_ID

# Grant permissions to GitHub Actions SA
export GH_SA_EMAIL=$(gcloud iam service-accounts list \
  --filter="displayName:GitHub" \
  --format='value(email)')

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member=serviceAccount:$GH_SA_EMAIL \
  --role=roles/container.developer

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member=serviceAccount:$GH_SA_EMAIL \
  --role=roles/artifactregistry.writer

# Get WIF provider resource name
export WIF_PROVIDER=$(gcloud iam workload-identity-pools providers describe "github-provider" \
  --project=$PROJECT_ID \
  --location=global \
  --workload-identity-pool="github-pool" \
  --format='value(name)')

echo "WIF Provider: $WIF_PROVIDER"
echo "GitHub SA Email: $GH_SA_EMAIL"
```

### 4.2 Add GitHub Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions → New repository secret

Add these secrets:

```
GCP_PROJECT_ID = your-gcp-project-id
GKE_CLUSTER_NAME = interview-coordination-cluster
GKE_REGION = us-central1
WIF_PROVIDER = projects/PROJECT_NUMBER/locations/global/workspaceIdentityPools/github-pool/providers/github-provider
WIF_SERVICE_ACCOUNT = github-actions-sa@your-gcp-project-id.iam.gserviceaccount.com
DATABASE_URL = postgresql://postgres:PASSWORD@CLOUD_SQL_IP:5432/interview_coordination?sslmode=require
NEXTAUTH_SECRET = your-random-secret-key-here
ARTIFACT_REGISTRY = us-central1-docker.pkg.dev/your-gcp-project-id/interview-coordination-docker
```

**To get DATABASE_URL:**
```bash
# From Terraform output
terraform output cloud_sql_private_ip
terraform output database_password
```

### 4.3 Authorize GitHub to Use Workload Identity

```bash
gcloud iam service-accounts add-iam-policy-binding $GH_SA_EMAIL \
  --project=$PROJECT_ID \
  --role=roles/iam.workloadIdentityUser \
  --member="principalSet://iam.googleapis.com/projects/$PROJECT_ID/locations/global/workloadIdentityPools/github-pool/attribute.repository/YOUR_GITHUB_USERNAME/YOUR_REPO_NAME"
```

---

## Step 5: Prepare Your App for GKE

### 5.1 Create .dockerignore files (already done but verify)

Both `frontend` and `backend` should have Dockerfiles configured.

### 5.2 Push to GitHub
```bash
git add .
git commit -m "Add Terraform and GitHub Actions for GKE deployment"
git push origin main
```

### 5.3 Trigger GitHub Actions

Push to your `main` branch → GitHub Actions automatically runs `deploy-gke.yml`

---

## Step 6: Access Your Deployed App

### 6.1 Get the Frontend LoadBalancer IP
```bash
# This will show the external IP after deployment
kubectl get service interview-frontend -n interview-coordination

# Wait a few minutes for the external IP to be assigned
kubectl get service interview-frontend -n interview-coordination --watch
```

### 6.2 Access the App
```
http://YOUR_EXTERNAL_IP
```

### 6.3 Useful kubectl Commands
```bash
# View deployments
kubectl get deployments -n interview-coordination

# View pods
kubectl get pods -n interview-coordination

# View logs
kubectl logs -n interview-coordination -l app=interview-backend -f
kubectl logs -n interview-coordination -l app=interview-frontend -f

# Check Kubernetes secrets
kubectl get secrets -n interview-coordination

# Port forward for testing
kubectl port-forward -n interview-coordination svc/interview-backend 4000:4000
kubectl port-forward -n interview-coordination svc/interview-frontend 3000:3000
```

---

## Cost Optimization for Free Tier

1. **Use preemptible nodes** ✓ (Already configured)
2. **Use e2-medium machines** ✓ (Already configured)
3. **Set auto-scaling limits** ✓ (Max 3 nodes)
4. **Use Cloud SQL f1-micro** ✓ (Already configured)
5. **Delete unused resources:**
   ```bash
   terraform destroy
   ```

---

## Troubleshooting

### Docker Image Not Building
```bash
# Build locally first to test
docker build -t interview-backend:test -f backend/Dockerfile .
docker build -t interview-frontend:test -f Dockerfile.frontend .
```

### Database Connection Issues
```bash
# Check if private IP is correct
gcloud sql instances describe interview-coordination-postgres --format='value(ipAddresses[0].ipAddress)'

# Check pod logs for connection errors
kubectl logs -n interview-coordination deployment/interview-backend
```

### LoadBalancer IP Stuck in Pending
```bash
# Wait longer (can take 5-10 minutes)
# Or check for quota limits
gcloud compute project-info describe --project=$PROJECT_ID
```

---

## Next Steps

1. Set up domain name (Cloud Domains or external provider)
2. Add HTTPS with Google-managed SSL certificates
3. Set up Cloud Armor for DDoS protection
4. Add more autoscaling configurations
5. Set up CI/CD monitoring and alerts

---

## Resources

- [GKE Documentation](https://cloud.google.com/kubernetes-engine/docs)
- [Terraform GCP Provider](https://registry.terraform.io/providers/hashicorp/google/latest/docs)
- [Cloud SQL Documentation](https://cloud.google.com/sql/docs)
- [GitHub Actions with GCP](https://github.com/google-github-actions)
