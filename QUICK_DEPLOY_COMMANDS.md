# Quick Commands Reference

## 1. GCP Setup (First Time)
```bash
export PROJECT_ID="your-project-id"
gcloud config set project $PROJECT_ID

# Enable APIs
gcloud services enable container.googleapis.com artifactregistry.googleapis.com sqladmin.googleapis.com compute.googleapis.com

# Create service account
gcloud iam service-accounts create terraform-sa --display-name="Terraform"
export SA_EMAIL=$(gcloud iam service-accounts list --filter="displayName:Terraform" --format='value(email)')

# Grant roles
gcloud projects add-iam-policy-binding $PROJECT_ID --member=serviceAccount:$SA_EMAIL --role=roles/container.admin
gcloud projects add-iam-policy-binding $PROJECT_ID --member=serviceAccount:$SA_EMAIL --role=roles/cloudsql.admin
gcloud projects add-iam-policy-binding $PROJECT_ID --member=serviceAccount:$SA_EMAIL --role=roles/compute.networkAdmin

# Get credentials
gcloud iam service-accounts keys create credentials.json --iam-account=$SA_EMAIL
export GOOGLE_APPLICATION_CREDENTIALS=$(pwd)/credentials.json
```

## 2. Terraform Provisioning
```bash
cd terraform
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars with your project_id

terraform init
terraform plan
terraform apply
```

## 3. GitHub Actions Setup
- Go to repo → Settings → Secrets → Add these:
  - `GCP_PROJECT_ID`
  - `GKE_CLUSTER_NAME` 
  - `GKE_REGION`
  - `WIF_PROVIDER`
  - `WIF_SERVICE_ACCOUNT`
  - `DATABASE_URL`
  - `NEXTAUTH_SECRET`

## 4. Deploy
```bash
# Push to main branch - GitHub Actions automatically deploys
git push origin main

# Check deployment status
kubectl get deployments -n interview-coordination
kubectl get pods -n interview-coordination

# Get frontend IP
kubectl get service interview-frontend -n interview-coordination
```

## 5. Monitor
```bash
# View logs
kubectl logs -n interview-coordination -l app=interview-backend -f

# Port forward for testing
kubectl port-forward -n interview-coordination svc/interview-frontend 3000:3000
```

## 6. Cleanup (Delete everything)
```bash
cd terraform
terraform destroy
```
