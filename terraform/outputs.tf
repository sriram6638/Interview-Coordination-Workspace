output "kubernetes_cluster_name" {
  value = google_container_cluster.primary.name
}

output "kubernetes_cluster_host" {
  value = google_container_cluster.primary.endpoint
}

output "project_id" {
  value = var.project_id
}

output "region" {
  value = var.region
}

output "kubernetes_cluster_ca_certificate" {
  value     = google_container_cluster.primary.master_auth[0].cluster_ca_certificate
  sensitive = true
}

# output "artifact_registry_repository" {
#   value = google_artifact_registry_repository.docker_repo.repository_id
# }

# output "artifact_registry_url" {
#   value = "${var.region}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.docker_repo.repository_id}"
# }

# output "cloud_sql_instance_connection_name" {
#   value = google_sql_database_instance.postgres.connection_name
# }

# output "cloud_sql_private_ip" {
#   value = google_sql_database_instance.postgres.private_ip_address
# }

# output "database_name" {
#   value = google_sql_database.database.name
# }

# output "database_user" {
#   value = google_sql_user.db_user.name
# }

# output "database_password" {
#   value     = random_password.db_password.result
#   sensitive = true
# }
