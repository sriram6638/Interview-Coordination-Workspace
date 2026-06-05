terraform {
  required_version = ">= 1.0"

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.23"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.0"
    }
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

provider "kubernetes" {
  host  = "https://${google_container_cluster.primary.endpoint}"
  token = data.google_client_config.default.access_token
  cluster_ca_certificate = base64decode(
    google_container_cluster.primary.master_auth[0].cluster_ca_certificate,
  )
}

data "google_client_config" "default" {}

# VPC Network
resource "google_compute_network" "vpc" {
  name                    = "${var.app_name}-vpc"
  auto_create_subnetworks = false
}

# Subnet
resource "google_compute_subnetwork" "subnet" {
  name          = "${var.app_name}-subnet"
  ip_cidr_range = "10.0.0.0/16"
  region        = var.region
  network       = google_compute_network.vpc.id
}

# GKE Cluster
resource "google_container_cluster" "primary" {
  name     = var.cluster_name
  location = var.region

  # Disable default node pool and create custom one
  remove_default_node_pool = true
  initial_node_count       = 1

  network    = google_compute_network.vpc.name
  subnetwork = google_compute_subnetwork.subnet.name

  deletion_protection = false

  # Bootstrap node pool uses HDD (pd-standard) to stay within SSD quota on free tier
  node_config {
    preemptible  = false
    machine_type = var.machine_type
    disk_size_gb = 12
    disk_type    = "pd-standard"

    oauth_scopes = [
      "https://www.googleapis.com/auth/cloud-platform"
    ]
  }

  workload_identity_config {
    workload_pool = "${var.project_id}.svc.id.goog"
  }

  resource_labels = {
    environment = var.environment
    app         = var.app_name
  }
}

# Node Pool
resource "google_container_node_pool" "primary_nodes" {
  name       = "${var.cluster_name}-node-pool"
  location   = var.region
  cluster    = google_container_cluster.primary.name
  node_count = var.num_nodes

  autoscaling {
    min_node_count = 1
    max_node_count = 1  # No autoscaling for free tier
  }

  node_config {
    preemptible  = false # asia-south1 preemptible CPU quota is 0 on free tier
    machine_type = var.machine_type
    disk_size_gb = 12  # Minimum for GKE COS image (12 GB)
    disk_type    = "pd-standard"  # HDD instead of SSD for free tier

    oauth_scopes = [
      "https://www.googleapis.com/auth/cloud-platform"
    ]

    labels = {
      environment = var.environment
      app         = var.app_name
    }

    tags = ["gke-node", "${var.app_name}-node"]

    workload_metadata_config {
      mode = "GKE_METADATA"
    }
  }
}

# Cloud SQL for PostgreSQL
# TODO: Enable after GKE cluster is created successfully
# resource "google_sql_database_instance" "postgres" {
#   name             = "${var.app_name}-postgres"
#   database_version = "POSTGRES_15"
#   region           = var.region
#
#   settings {
#     tier      = "db-f1-micro" # Free tier
#     disk_size = 10
#     disk_type = "PD_HDD"
#
#     backup_configuration {
#       enabled = true
#     }
#
#     ip_configuration {
#       ssl_mode     = "ENCRYPTED_ONLY"
#       ipv4_enabled = true
#       # Remove private network for free trial
#       # private_network = google_compute_network.vpc.id
#     }
#   }
#
#   deletion_protection = false
# }

# PostgreSQL Database
# resource "google_sql_database" "database" {
#   name     = "interview_coordination"
#   instance = google_sql_database_instance.postgres.name
# }

# PostgreSQL User (random password)
# resource "random_password" "db_password" {
#   length  = 16
#   special = true
# }
#
# resource "google_sql_user" "db_user" {
#   name     = "postgres"
#   instance = google_sql_database_instance.postgres.name
#   password = random_password.db_password.result
# }

# Kubernetes Namespace
resource "kubernetes_namespace" "app" {
  metadata {
    name = var.app_name
  }

  depends_on = [
    google_container_node_pool.primary_nodes
  ]
}

# Store DB credentials in Kubernetes Secret
# resource "kubernetes_secret" "db_credentials" {
#   metadata {
#     name      = "db-credentials"
#     namespace = kubernetes_namespace.app.metadata[0].name
#   }
#
#   data = {
#     DATABASE_URL = "postgresql://${google_sql_user.db_user.name}:${random_password.db_password.result}@${google_sql_database_instance.postgres.private_ip_address}:5432/${google_sql_database.database.name}?sslmode=require"
#     DB_HOST      = google_sql_database_instance.postgres.private_ip_address
#     DB_USER      = google_sql_user.db_user.name
#     DB_PASSWORD  = random_password.db_password.result
#     DB_NAME      = google_sql_database.database.name
#   }
#
#   depends_on = [
#     kubernetes_namespace.app
#   ]
# }

# Container Registry (Artifact Registry)
# TODO: Enable after fixing IAM permissions
# resource "google_artifact_registry_repository" "docker_repo" {
#   location      = var.region
#   repository_id = "${var.app_name}-docker"
#   description   = "Docker repository for ${var.app_name}"
#   format        = "DOCKER"
# }
