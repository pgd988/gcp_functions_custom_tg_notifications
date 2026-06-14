# GCP Pub/Sub Telegram Notification (Terraform Module)

This repository contains a Terraform module that deploys a Google Cloud Function (Gen 2) to receive incident alerts from a Cloud Pub/Sub topic and send beautifully formatted notifications to a Telegram chat. 

The module:
- Zips the Node.js source code automatically.
- Creates a Google Cloud Storage bucket for the function's source code.
- Uploads the zipped source code to the bucket.
- Deploys the Gen 2 Cloud Function and wires it up to the specified Pub/Sub topic using Eventarc.

## Prerequisites

- Terraform >= 1.3
- A Telegram Bot Token (obtained from [@BotFather](https://t.me/BotFather))
- A Telegram Chat ID (where the bot is a member and has permissions to post)
- A Google Cloud Project ID

## Usage

You can connect this module to your main Terraform infrastructure project by referencing this repository (or a local path) in a `module` block.

```hcl
module "telegram_notifier" {
  source = "github.com/your-org/gcp-pubsub-telegram-notification" # OR local path e.g. "../modules/gcp-pubsub-telegram-notification"

  project_id       = "your-gcp-project-id"
  region           = "us-central1"
  bucket_name      = "my-unique-function-source-bucket-123"
  
  # The fully qualified ID of the Pub/Sub topic to trigger the function
  pubsub_topic_id  = "projects/your-gcp-project-id/topics/your-topic-name"

  # Telegram credentials (ideally passed securely via variables/secrets)
  telegram_token   = var.telegram_token
  telegram_chat_id = var.telegram_chat_id
}
```

### Inputs

| Name | Description | Type | Default | Required |
|------|-------------|------|---------|:--------:|
| `project_id` | The GCP project ID | `string` | n/a | yes |
| `region` | The GCP region to deploy the function and bucket | `string` | `"us-central1"` | no |
| `bucket_name` | Globally unique name for the GCS bucket storing the source code | `string` | n/a | yes |
| `bucket_location` | Location for the GCS bucket | `string` | `"US"` | no |
| `function_name` | Name of the Cloud Function | `string` | `"tg-notifier"` | no |
| `pubsub_topic_id` | Fully qualified Pub/Sub topic ID | `string` | n/a | yes |
| `telegram_token` | Telegram Bot Token | `string` | n/a | yes |
| `telegram_chat_id` | Telegram Chat ID | `string` | n/a | yes |
| `labels` | A map of labels to apply to the resources | `map(string)` | `{}` | no |

### Outputs

| Name | Description |
|------|-------------|
| `function_name` | The name of the deployed Cloud Function |
| `function_uri` | The internal URI of the deployed Cloud Function |

## Local Development (Testing the Node.js function)

If you wish to test the function code locally:
1. Navigate to the `src/` directory.
2. Copy the `.env_example` file (in the root directory) to `.env` in `src/`.
3. Fill in the values.
4. Run `npm install` inside `src/`.
