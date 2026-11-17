variable "domain" {
  description = "Apex domain served by the site."
  type        = string
  default     = "haki.tools"
}

variable "github_repo" {
  description = "owner/name of the repo allowed to deploy."
  type        = string
  default     = "akoben-dev/haki-tools"
}

variable "custom_domain_enabled" {
  description = <<-EOT
    Attach haki.tools / www.haki.tools to CloudFront. Leave false until the ACM
    certificate shows ISSUED (its DNS validation record has been added at
    Namecheap). Before that, the site is reachable on its *.cloudfront.net name.
  EOT
  type        = bool
  default     = false
}
