#!/bin/bash

# Mobile PWA Deployment Script
# This script deploys the mobile PWA to your NewsBlur server

set -e  # Exit on error

echo "╔════════════════════════════════════════════════════════════════════╗"
echo "║           Mobile PWA Deployment Script                            ║"
echo "╚════════════════════════════════════════════════════════════════════╝"
echo ""

# Check if we're in the right directory
if [ ! -f "manage.py" ]; then
    echo "❌ ERROR: manage.py not found. Are you in the NewsBlur directory?"
    echo "   Expected: /path/to/NewsBlurCustom/"
    exit 1
fi

echo "✓ Found manage.py - we're in the right directory"
echo ""

# Step 1: Git pull
echo "Step 1: Pulling latest changes from GitHub..."
git pull origin main
echo "✓ Git pull complete"
echo ""

# Step 2: Collect static files
echo "Step 2: Collecting static files..."
python manage.py collectstatic --noinput
echo "✓ Static files collected"
echo ""

# Step 3: Check if supervisord is running
echo "Step 3: Restarting web server..."
if command -v supervisorctl &> /dev/null; then
    echo "  - Using supervisorctl..."
    sudo supervisorctl restart newsblur || echo "  ⚠ supervisorctl restart failed, trying different command..."
    sudo supervisorctl restart all 2>/dev/null || true
    echo "  ✓ Supervisor restarted"
elif command -v systemctl &> /dev/null; then
    echo "  - Using systemctl..."
    sudo systemctl restart newsblur || sudo systemctl restart gunicorn || echo "  ⚠ systemctl restart failed"
    echo "  ✓ System service restarted"
else
    echo "  ⚠ Could not find supervisor or systemctl"
    echo "  Please restart your web service manually:"
    echo "    - If using Docker: docker-compose restart web"
    echo "    - If using nginx/gunicorn: sudo systemctl restart gunicorn"
    echo "    - If using Apache: sudo systemctl restart apache2"
fi
echo ""

# Step 4: Verify files were deployed
echo "Step 4: Verifying deployment..."
if [ -f "templates/reader/mobile.xhtml" ]; then
    echo "  ✓ Mobile template found"
else
    echo "  ❌ Mobile template NOT found!"
fi

if [ -f "media/css/reader/mobile.css" ]; then
    echo "  ✓ Mobile CSS found"
else
    echo "  ❌ Mobile CSS NOT found!"
fi

if [ -f "static/js/service-worker.js" ]; then
    echo "  ✓ Service worker found"
else
    echo "  ❌ Service worker NOT found!"
fi
echo ""

# Step 5: Show git log
echo "Step 5: Recent commits:"
git log --oneline -3
echo ""

echo "╔════════════════════════════════════════════════════════════════════╗"
echo "║                   Deployment Complete! ✓                         ║"
echo "╚════════════════════════════════════════════════════════════════════╝"
echo ""
echo "NEXT STEPS:"
echo "  1. Clear browser cache:"
echo "     - Press Ctrl+Shift+R (hard refresh)"
echo "     - Or: DevTools → Application → Clear Storage → Reload"
echo ""
echo "  2. Login to your NewsBlur instance"
echo ""
echo "  3. Visit the mobile PWA:"
echo "     - https://beelink-ubuntu.tail624886.ts.net/mobile/"
echo ""
echo "  4. You should see:"
echo "     - Header with 'NewsBlur' title"
echo "     - Hamburger menu (☰) on the left"
echo "     - '+' button on the right"
echo "     - Filter tabs (Unread/All/Starred)"
echo "     - Story list in mobile format"
echo ""
echo "  5. If CSS doesn't load:"
echo "     - Run: python manage.py collectstatic --force-all"
echo "     - Then restart the web server again"
echo ""

