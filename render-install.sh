#!/usr/bin/env bash
# exit on error
set -o errexit

# Install Python dependencies
pip install --upgrade pip
pip install -r requirements.txt

# Install Playwright browsers for PDF generation
# Note: System dependencies should be handled by Render's environment
playwright install chromium

# Collect static files
python manage.py collectstatic --no-input

# Run migrations
python manage.py migrate

# Create superuser if none exists
python manage.py create_superuser_if_none_exists
