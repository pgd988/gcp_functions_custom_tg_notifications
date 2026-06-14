variable "project_id" {
  description = "The GCP project ID"
  type        = string
}

variable "region" {
  description = "The GCP region to deploy the function and bucket in"
  type        = string
  default     = "us-central1"
}

variable "bucket_name" {
  description = "Name of the Google Cloud Storage bucket to create for the function source code"
  type        = string
}

variable "bucket_location" {
  description = "Location for the Google Cloud Storage bucket"
  type        = string
  default     = "US"
}

variable "function_name" {
  description = "Name of the Cloud Function"
  type        = string
  default     = "tg-notifier"
}

variable "pubsub_topic_id" {
  description = "The fully qualified Pub/Sub topic ID (e.g. projects/my-project/topics/my-topic) that triggers this function"
  type        = string
}

variable "telegram_token" {
  description = "Telegram Bot Token"
  type        = string
  sensitive   = true
}

variable "telegram_chat_id" {
  description = "Telegram Chat ID"
  type        = string
}

variable "labels" {
  description = "A map of labels to apply to the resources"
  type        = map(string)
  default     = "monitoring"
}
