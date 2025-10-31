#!/bin/bash

echo "Sending test email to check spam folder..."

curl -X POST http://localhost:3004/api/email \
  -H 'Content-Type: application/json' \
  -d '{"type": "custom", "data": {"to": "ronellbradley@bradleyvs.com", "subject": "CHECK SPAM FOLDER - RentFlow Test", "customMessage": "This is a test email from RentFlow. Please check your spam/junk folder if you do not see this in your inbox."}}'

echo ""
echo "Email sent! Check your inbox and spam folder."
