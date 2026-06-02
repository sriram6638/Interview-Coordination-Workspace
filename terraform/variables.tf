variable "project_id" {
  description = "GCP Project ID"
  type        = string
}

variable "region" {
  description = "GCP Region"
  type        = string
  default     = "us-central1"
}

variable "zone" {
  description = "GCP Zone"
  type        = string
  default     = "us-central1-a"
}

variable "cluster_name" {
  description = "GKE Cluster Name"
  type        = string
  default     = "interview-coordination-cluster"
}

variable "machine_type" {
  description = "Machine type for GKE nodes (free tier: e2-medium)"
  type        = string
  default     = "e2-medium"
}

variable "num_nodes" {
  description = "Number of nodes in the cluster (free tier: 1-3)"
  type        = number
  default     = 1
}

variable "app_name" {
  description = "Application name"
  type        = string
  default     = "interview-coordination"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "production"
}
