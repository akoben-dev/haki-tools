locals {
  aliases = [var.domain, "www.${var.domain}"]
  # AWS-managed "CachingOptimized" cache policy (gzip + brotli, honours origin Cache-Control).
  caching_optimized = "658327ea-f89d-4fab-a63d-7e88639e58f6"
  # AWS-managed "CachingDisabled" and "AllViewerExceptHostHeader" (for the API origin).
  caching_disabled       = "4135ea2d-6df8-44a3-9df3-4b5a84be39ad"
  all_viewer_except_host = "b689b0a8-53d0-40ab-baf2-68738e2966ac"
}

# B7: public certificate for the apex and www, validated by a DNS record at Namecheap.
resource "aws_acm_certificate" "site" {
  domain_name               = var.domain
  subject_alternative_names = ["www.${var.domain}"]
  validation_method         = "DNS"
  lifecycle {
    create_before_destroy = true
  }
}

# B4: Origin Access Control. CloudFront signs its S3 requests; the bucket trusts only it.
resource "aws_cloudfront_origin_access_control" "site" {
  name                              = "haki-site"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

# B5
resource "aws_cloudfront_function" "viewer_request" {
  name    = "haki-viewer-request"
  runtime = "cloudfront-js-2.0"
  comment = "www -> apex, trailing slash, /dir/ -> /dir/index.html"
  publish = true
  code    = file("${path.module}/functions/viewer-request.js")
}

# B6: security headers on every response.
resource "aws_cloudfront_response_headers_policy" "security" {
  name = "haki-security-headers"

  security_headers_config {
    strict_transport_security {
      access_control_max_age_sec = 63072000
      include_subdomains         = false # other haki.tools subdomains are not ours to force onto HTTPS
      preload                    = false
      override                   = true
    }
    content_type_options {
      override = true
    }
    frame_options {
      frame_option = "DENY"
      override     = true
    }
    referrer_policy {
      referrer_policy = "strict-origin-when-cross-origin"
      override        = true
    }
    content_security_policy {
      override = true
      content_security_policy = join("; ", [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline'",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data:",
        "font-src 'self'",
        "connect-src 'self'",
        "form-action 'self'",
        "base-uri 'self'",
        "frame-ancestors 'none'",
        "object-src 'none'",
      ])
    }
  }

  custom_headers_config {
    items {
      header   = "Permissions-Policy"
      value    = "camera=(), microphone=(), geolocation=(), interest-cohort=()"
      override = true
    }
  }
}

# B3
resource "aws_cloudfront_distribution" "site" {
  enabled             = true
  comment             = "haki.tools"
  default_root_object = "index.html"
  price_class         = "PriceClass_100"
  http_version        = "http2and3"
  is_ipv6_enabled     = true
  aliases             = var.custom_domain_enabled ? local.aliases : []

  origin {
    origin_id                = "site-bucket"
    domain_name              = aws_s3_bucket.site.bucket_regional_domain_name
    origin_access_control_id = aws_cloudfront_origin_access_control.site.id
  }

  # C2: same-origin /api/* goes to the contact API (no CORS needed).
  origin {
    origin_id   = "contact-api"
    domain_name = replace(aws_apigatewayv2_api.contact.api_endpoint, "https://", "")
    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "https-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  ordered_cache_behavior {
    path_pattern               = "/api/*"
    target_origin_id           = "contact-api"
    viewer_protocol_policy     = "redirect-to-https"
    allowed_methods            = ["GET", "HEAD", "OPTIONS", "PUT", "POST", "PATCH", "DELETE"]
    cached_methods             = ["GET", "HEAD"]
    compress                   = true
    cache_policy_id            = local.caching_disabled
    origin_request_policy_id   = local.all_viewer_except_host
    response_headers_policy_id = aws_cloudfront_response_headers_policy.security.id
  }

  default_cache_behavior {
    target_origin_id           = "site-bucket"
    viewer_protocol_policy     = "redirect-to-https"
    allowed_methods            = ["GET", "HEAD"]
    cached_methods             = ["GET", "HEAD"]
    compress                   = true
    cache_policy_id            = local.caching_optimized
    response_headers_policy_id = aws_cloudfront_response_headers_policy.security.id

    function_association {
      event_type   = "viewer-request"
      function_arn = aws_cloudfront_function.viewer_request.arn
    }
  }

  # Without ListBucket, S3 answers 403 for a missing key; show the site's 404 page.
  custom_error_response {
    error_code            = 403
    response_code         = 404
    response_page_path    = "/404.html"
    error_caching_min_ttl = 60
  }
  custom_error_response {
    error_code            = 404
    response_code         = 404
    response_page_path    = "/404.html"
    error_caching_min_ttl = 60
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = !var.custom_domain_enabled
    acm_certificate_arn            = var.custom_domain_enabled ? aws_acm_certificate.site.arn : null
    ssl_support_method             = var.custom_domain_enabled ? "sni-only" : null
    minimum_protocol_version       = var.custom_domain_enabled ? "TLSv1.2_2021" : "TLSv1"
  }
}
