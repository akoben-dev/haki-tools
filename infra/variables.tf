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
    Attach haki.tools / www.haki.tools to CloudFront. Needs the ACM
    certificate ISSUED (validation CNAMEs at Namecheap; issued 2026-11-17).
  EOT
  type        = bool
  default     = true
}
