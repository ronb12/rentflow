#!/bin/bash

echo "🧪 SendGrid Integration Test"
echo "=========================="
echo ""

# Test 1: Check configuration
echo "1. Checking SendGrid configuration..."
curl -s http://localhost:3004/api/email | jq .
echo ""

# Test 2: Send test email
echo "2. To test email sending, run this command with your email:"
echo ""
echo "curl -X POST http://localhost:3004/api/email \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{"
echo "    \"type\": \"custom\","
echo "    \"data\": {"
echo "      \"to\": \"YOUR_EMAIL@example.com\","
echo "      \"subject\": \"RentFlow Test Email\","
echo "      \"customMessage\": \"This is a test email from RentFlow!\""
echo "    }"
echo "  }'"
echo ""
echo "Replace YOUR_EMAIL@example.com with your actual email address"
