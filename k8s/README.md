# Kubernetes Deployment for Interview Coordination Workspace

This directory contains Kubernetes manifests for running the app and PostgreSQL locally in a cluster.

## Local Kubernetes workflow

1. Build the Docker image locally:

```bash
docker build -t interview-app .
```

2. If you are using `kind` or another local cluster, load the image:

```bash
kind load docker-image interview-app:latest
```

3. Create the secret values.

```bash
kubectl apply -f k8s/secret-example.yaml
```

Replace the placeholder values in `k8s/secret-example.yaml` with real values before applying.

4. Apply the database resources:

```bash
kubectl apply -f k8s/postgres-pvc.yaml
kubectl apply -f k8s/postgres-deployment.yaml
kubectl apply -f k8s/postgres-service.yaml
```

5. Apply the backend resources:

```bash
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/backend-service.yaml
```

6. Apply the frontend resources:

```bash
kubectl apply -f k8s/app-deployment.yaml
kubectl apply -f k8s/app-service.yaml
```

6. Verify the pods:

```bash
kubectl get pods
kubectl get svc
```

7. Access the app locally:

```bash
kubectl port-forward svc/interview-frontend 3000:3000
```

Then visit `http://localhost:3000`.

## Notes

- The app service uses `NodePort` on port `30080` for local testing.
- The PostgreSQL service is internal to the cluster at `interview-postgres:5432`.
- Secrets should be managed securely for production.
- For GKE, replace `nodePort` with `LoadBalancer` and push the image to a registry.
