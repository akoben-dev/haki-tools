locals {
  contact_from = "website@${var.domain}"
}

# C1: SES domain identity with Easy DKIM (3 CNAMEs at Namecheap) ...
resource "aws_sesv2_email_identity" "domain" {
  email_identity = var.domain
}

# ... and the recipient. While SES is in the sandbox it may only send to verified
# addresses; AWS emails a confirmation link to this inbox once.
resource "aws_sesv2_email_identity" "recipient" {
  email_identity = var.contact_to
}

# C5: key that signs the form's anti-bot timestamp. Never printed; lives only in
# SSM and the (private, encrypted) state bucket.
resource "random_password" "hmac" {
  length  = 48
  special = false
}

resource "aws_ssm_parameter" "hmac" {
  name  = "/haki/contact/hmac-key"
  type  = "SecureString"
  value = random_password.hmac.result
}

# C4
resource "aws_cloudwatch_log_group" "contact" {
  name              = "/aws/lambda/haki-contact"
  retention_in_days = 30
}

# C3: function + role that may only read its key and send from website@haki.tools.
data "aws_iam_policy_document" "lambda_trust" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "contact" {
  name               = "haki-contact-lambda"
  assume_role_policy = data.aws_iam_policy_document.lambda_trust.json
}

data "aws_iam_policy_document" "contact" {
  statement {
    sid       = "Logs"
    actions   = ["logs:CreateLogStream", "logs:PutLogEvents"]
    resources = ["${aws_cloudwatch_log_group.contact.arn}:*"]
  }
  statement {
    sid       = "ReadKey"
    actions   = ["ssm:GetParameter"]
    resources = [aws_ssm_parameter.hmac.arn]
  }
  statement {
    sid       = "SendFromWebsite"
    actions   = ["ses:SendEmail"]
    resources = ["*"]
    condition {
      test     = "StringEquals"
      variable = "ses:FromAddress"
      values   = [local.contact_from]
    }
  }
}

resource "aws_iam_role_policy" "contact" {
  name   = "contact"
  role   = aws_iam_role.contact.id
  policy = data.aws_iam_policy_document.contact.json
}

data "archive_file" "contact" {
  type        = "zip"
  source_dir  = "${path.module}/lambda/contact"
  output_path = "${path.module}/.build/contact.zip"
}

resource "aws_lambda_function" "contact" {
  function_name    = "haki-contact"
  role             = aws_iam_role.contact.arn
  runtime          = "nodejs22.x"
  architectures    = ["arm64"]
  handler          = "index.handler"
  memory_size      = 128
  timeout          = 10
  filename         = data.archive_file.contact.output_path
  source_code_hash = data.archive_file.contact.output_base64sha256

  environment {
    variables = {
      FROM_ADDRESS = "Haki Tools website <${local.contact_from}>"
      TO_ADDRESS   = var.contact_to
      HMAC_PARAM   = aws_ssm_parameter.hmac.name
    }
  }

  logging_config {
    log_format = "Text"
    log_group  = aws_cloudwatch_log_group.contact.name
  }
}

# C2: HTTP API, reached through CloudFront at /api/*, throttled to 1 rps (burst 5).
resource "aws_apigatewayv2_api" "contact" {
  name          = "haki-contact"
  protocol_type = "HTTP"
}

resource "aws_apigatewayv2_integration" "contact" {
  api_id                 = aws_apigatewayv2_api.contact.id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.contact.invoke_arn
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "post" {
  api_id    = aws_apigatewayv2_api.contact.id
  route_key = "POST /api/contact"
  target    = "integrations/${aws_apigatewayv2_integration.contact.id}"
}

resource "aws_apigatewayv2_route" "token" {
  api_id    = aws_apigatewayv2_api.contact.id
  route_key = "GET /api/contact/token"
  target    = "integrations/${aws_apigatewayv2_integration.contact.id}"
}

resource "aws_apigatewayv2_stage" "default" {
  api_id      = aws_apigatewayv2_api.contact.id
  name        = "$default"
  auto_deploy = true
  default_route_settings {
    throttling_rate_limit  = 1
    throttling_burst_limit = 5
  }
}

resource "aws_lambda_permission" "api" {
  statement_id  = "AllowHttpApi"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.contact.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.contact.execution_arn}/*/*"
}

# C6: email Everett when the form returns server errors (Lambda crash or SES failure).
resource "aws_sns_topic" "alerts" {
  name = "haki-alerts"
}

resource "aws_sns_topic_subscription" "alerts_email" {
  topic_arn = aws_sns_topic.alerts.arn
  protocol  = "email"
  endpoint  = var.contact_to
}

resource "aws_cloudwatch_metric_alarm" "contact_5xx" {
  alarm_name          = "haki-contact-errors"
  alarm_description   = "The haki.tools contact form returned a server error. Check /aws/lambda/haki-contact."
  namespace           = "AWS/ApiGateway"
  metric_name         = "5xx"
  dimensions          = { ApiId = aws_apigatewayv2_api.contact.id, Stage = "$default" }
  statistic           = "Sum"
  period              = 300
  evaluation_periods  = 1
  threshold           = 0
  comparison_operator = "GreaterThanThreshold"
  treat_missing_data  = "notBreaching"
  alarm_actions       = [aws_sns_topic.alerts.arn]
}
