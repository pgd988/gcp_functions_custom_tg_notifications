output "function_name" {
  description = "The name of the Cloud Function"
  value       = google_cloudfunctions2_function.telegram_notifier.name
}

output "function_uri" {
  description = "The URI of the Cloud Function"
  value       = google_cloudfunctions2_function.telegram_notifier.service_config[0].uri
}
