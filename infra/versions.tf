terraform {
  required_version = ">= 1.10"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
    archive = {
      source  = "hashicorp/archive"
      version = "~> 2.7"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.7"
    }
  }

  # B1: created once by hand (see README), versioned + encrypted + private.
  # use_lockfile = S3-native state locking, so no DynamoDB table is needed.
  backend "s3" {
    bucket       = "haki-tools-tfstate-655385895055"
    key          = "site/terraform.tfstate"
    region       = "us-east-1"
    encrypt      = true
    use_lockfile = true
  }
}

provider "aws" {
  region = "us-east-1" # CloudFront certificates must live in us-east-1

  default_tags {
    tags = {
      project    = "haki-tools"
      managed-by = "terraform"
    }
  }
}

data "aws_caller_identity" "current" {}
