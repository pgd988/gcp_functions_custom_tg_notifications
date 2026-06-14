locals {
  services = toset([
    "cloudfunctions.googleapis.com",
    "cloudbuild.googleapis.com",
    "artifactregistry.googleapis.com",
    "run.googleapis.com",
    "pubsub.googleapis.com",
    "eventarc.googleapis.com"
  ])

  labels = merge(
    {
      "managed-by" = "terraform"
      "module"     = "telegram-notifier"
    },
    var.labels
  )
}

resource "google_project_service" "enabled_apis" {
  for_each = local.services

  project = var.project_id
  service = each.value

  disable_on_destroy         = false
  disable_dependent_services = false
}

data "archive_file" "function_zip" {
  type        = "zip"
  source_dir  = "${path.module}/src"
  output_path = "${path.module}/function-source.zip"
}

resource "google_storage_bucket" "function_bucket" {
  name                        = var.bucket_name
  location                    = var.bucket_location
  uniform_bucket_level_access = true
  force_destroy               = true
  labels                      = local.labels
}

resource "google_storage_bucket_object" "function_zip" {
  name   = "function-source-${data.archive_file.function_zip.output_md5}.zip"
  bucket = google_storage_bucket.function_bucket.name
  source = data.archive_file.function_zip.output_path
}

resource "google_cloudfunctions2_function" "telegram_notifier" {
  name        = var.function_name
  location    = var.region
  description = "Telegram Notification Function"
  labels      = local.labels

  depends_on = [google_project_service.enabled_apis]

  build_config {
    runtime     = "nodejs20"
    entry_point = "messageparser"
    source {
      storage_source {
        bucket = google_storage_bucket.function_bucket.name
        object = google_storage_bucket_object.function_zip.name
      }
    }
  }

  service_config {
    max_instance_count = 1
    available_memory   = "256M"
    timeout_seconds    = 60

    environment_variables = {
      TOKEN      = var.telegram_token
      CHAT_ID    = var.telegram_chat_id
      PROJECT_ID = var.project_id
    }
  }

  event_trigger {
    trigger_region = var.region
    event_type     = "google.cloud.pubsub.topic.v1.messagePublished"
    pubsub_topic   = var.pubsub_topic_id
    retry_policy   = "RETRY_POLICY_DO_NOT_RETRY"
  }
}
