#!/bin/bash
cd /Users/ronellbradley/Desktop/RentFlow

# Remove any lock files
find .git -name "*.lock" -delete

# Fetch latest changes
git fetch origin

# Try to pull and rebase
git pull origin main --rebase

# If successful, push
git push origin main

echo "Push completed!"

