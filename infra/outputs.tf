output "site_bucket" {
  value = aws_s3_bucket.site.bucket
}

output "distribution_id" {
  value = aws_cloudfront_distribution.site.id
}

output "cloudfront_domain" {
  description = "Test URL before DNS moves; also the target for the Namecheap records at cutover (S4)."
  value       = aws_cloudfront_distribution.site.domain_name
}

output "deploy_role_arn" {
  value = aws_iam_role.github_deploy.arn
}

output "certificate_status" {
  value = aws_acm_certificate.site.status
}

output "certificate_validation_records" {
  description = "Add these CNAMEs at Namecheap (host = name without the trailing .haki.tools.)."
  value = [for o in aws_acm_certificate.site.domain_validation_options : {
    domain = o.domain_name
    name   = o.resource_record_name
    type   = o.resource_record_type
    value  = o.resource_record_value
  }]
}

output "ses_dkim_records" {
  description = "Add these 3 CNAMEs at Namecheap (C1)."
  value = [for t in aws_sesv2_email_identity.domain.dkim_signing_attributes[0].tokens : {
    host  = "${t}._domainkey"
    type  = "CNAME"
    value = "${t}.dkim.amazonses.com"
  }]
}

output "ses_mail_from_records" {
  description = "Add these at Namecheap (host relative to haki.tools) for the custom MAIL FROM domain."
  value = [
    { host = "mail", type = "MX", value = "feedback-smtp.us-east-1.amazonses.com", priority = 10 },
    { host = "mail", type = "TXT", value = "v=spf1 include:amazonses.com ~all" },
  ]
}
