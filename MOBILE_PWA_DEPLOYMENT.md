# Mobile PWA Deployment Guide

## Quick Start (5 minutes)

To deploy the mobile PWA to your remote server:

```bash
# 1. SSH into your server
ssh user@beelink-ubuntu.tail624886.ts.net

# 2. Navigate to NewsBlur directory
cd /path/to/NewsBlurCustom

# 3. Run the automated deployment script
bash deploy-mobile-pwa.sh
```

That's it! The script will:
- Pull the latest code from GitHub
- Collect static files (CSS/JS)
- Restart the web server
- Verify everything is in place

Then:
1. Clear browser cache: **Ctrl+Shift+R**
2. Login to your NewsBlur instance
3. Visit: `https://beelink-ubuntu.tail624886.ts.net/mobile/`

---

## What Was Added

### Templates
- `templates/reader/mobile.xhtml` - Mobile UI (single-pane layout)
- `templates/offline.html` - Offline fallback page

### Styles
- `media/css/reader/mobile.css` - Mobile-optimized CSS (9.6 KB)

### JavaScript
- `static/js/service-worker.js` - Service worker for offline/caching
- `static/js/newsblur/mobile/mobile_reader.js` - Backbone.js mobile app

### PWA
- `public/manifest.webmanifest` - PWA app manifest

### Deployment
- `deploy-mobile-pwa.sh` - Automated deployment script (this file)

---

## Expected Result

After deployment, visiting `https://beelink-ubuntu.tail624886.ts.net/mobile/` should show:

- **Header**: "NewsBlur" title with hamburger menu (☰) and add feed (+) button
- **Navigation**: Tap hamburger menu to reveal sidebar with your feeds
- **Stories**: Single-pane list of stories with filtering tabs (Unread/All/Starred)
- **Detail View**: Tap a story to read it with star (★) and mark read (✓) actions
- **Mobile Optimized**: Touch-friendly buttons (48px+), responsive layout
- **Offline**: Works offline with cached stories
- **PWA**: Can be installed as app icon on home screen

---

## Manual Deployment (If script doesn't work)

### Step 1: Pull Changes
```bash
cd /path/to/NewsBlurCustom
git pull origin main
```

### Step 2: Collect Static Files
```bash
python manage.py collectstatic --noinput
```

If that fails or CSS doesn't load, try:
```bash
python manage.py collectstatic --force-all --noinput
```

### Step 3: Restart Web Server

Choose the appropriate command for your setup:

**Using Supervisor:**
```bash
sudo supervisorctl restart newsblur
# or if that doesn't work:
sudo supervisorctl restart all
```

**Using systemctl:**
```bash
sudo systemctl restart newsblur
# or for specific services:
sudo systemctl restart gunicorn
sudo systemctl restart uwsgi
```

**Using Docker:**
```bash
docker-compose restart web
# or:
docker-compose down
docker-compose up -d
```

**Using Apache:**
```bash
sudo systemctl restart apache2
```

### Step 4: Verify

Check that files were deployed:
```bash
# Should all exist:
ls -la templates/reader/mobile.xhtml
ls -la media/css/reader/mobile.css
ls -la static/js/service-worker.js
ls -la public/manifest.webmanifest

# Check recent commits:
git log --oneline -5
```

---

## Troubleshooting

### Problem: Still don't see the mobile PWA

**Solution 1: Clear browser cache**
- Hard refresh: `Ctrl+Shift+R`
- Or: DevTools (F12) → Application → Clear Storage → Reload

**Solution 2: Verify login**
- Check that you're logged in (username should appear in top right)
- If not logged in, you'll see the welcome/login page

**Solution 3: Check browser console**
- Open DevTools: `F12`
- Go to Console tab
- Look for errors
- Check Network tab to see if CSS/JS are loading

### Problem: CSS/JS files show 404 errors

**Solution:**
```bash
# Collect static files again
python manage.py collectstatic --force-all --noinput

# Restart web server
sudo supervisorctl restart newsblur
```

### Problem: Service worker not registering

- Make sure you're using HTTPS (or localhost for local testing)
- Open DevTools → Application → Service Workers
- Should show `service-worker.js` registered
- Check browser console for errors

### Problem: Feeds/stories not loading

- Ensure you're logged in
- Check DevTools → Network tab
- Verify API endpoint is accessible: `curl https://yourdomain/reader/feeds/`
- Look for CORS or permission errors in console

---

## Deployed Commits

These commits contain the mobile PWA code:

```
ddd266ca1 - Add mobile PWA deployment script
58cc6d71e - Add critical PWA JavaScript files (service worker and mobile reader)
5b4379b1f - Add mobile PWA improvements: offline fallback and service worker registration
4ea7901fc - Add mobile PWA foundation (Week 1)
```

All are pushed to: https://github.com/bxh12/NewsBlurCustom

---

## Testing Checklist

After deployment:

- [ ] Login works
- [ ] Mobile route loads: `/mobile/`
- [ ] Header displays with title and buttons
- [ ] Hamburger menu toggles sidebar
- [ ] Feeds load in sidebar
- [ ] Stories display in list
- [ ] Filter tabs work (unread/all/starred)
- [ ] Can click story to view details
- [ ] Back button returns to list
- [ ] Star button works
- [ ] Mark read button works
- [ ] Add feed button works
- [ ] CSS is styled (not unstyled HTML)
- [ ] Service worker registers (DevTools → Service Workers)
- [ ] Works offline (toggle offline in DevTools)
- [ ] Works on real mobile device (iOS Safari or Android Chrome)
- [ ] Can install as PWA (mobile: tap menu → "Add to Home Screen")

---

## Performance

- **Initial load**: ~35 KB of new assets
- **Gzipped**: ~10 KB
- **Target**: < 3 seconds on 4G
- **Service worker**: Caches assets for faster repeat visits

---

## Support

If you encounter issues:

1. **Check deployment**:
   - Did `git pull origin main` complete?
   - Did `collectstatic` complete?
   - Did web server restart?

2. **Check browser**:
   - Clear cache: `Ctrl+Shift+R`
   - Open DevTools: `F12`
   - Check Console for errors
   - Check Network for failed requests

3. **Check server**:
   - Look at web server logs (nginx/Apache/gunicorn)
   - Look at Django logs
   - Check file permissions

4. **Still stuck?**:
   - Try manual deployment steps above
   - Try `python manage.py collectstatic --force-all`
   - Try restarting the server again

---

## Next Steps (Week 2)

After mobile PWA is working:

1. **Web Push Notifications**
   - Add subscription UI in mobile app
   - Wire to backend
   - Test push delivery

2. **Real Device Testing**
   - Test on iPhone (iOS Safari)
   - Test on Android phone (Chrome)
   - Test on tablet (iPad/Android tablet)

3. **Performance Optimization**
   - Minimize assets
   - Test load time on 4G
   - Optimize images

4. **Install Prompt**
   - Show "Install app" button
   - Handle installation flow

---

## File Structure

```
NewsBlurCustom/
├── templates/
│   ├── reader/
│   │   └── mobile.xhtml          # Mobile UI template
│   └── offline.html               # Offline fallback
├── media/css/reader/
│   └── mobile.css                 # Mobile styles
├── static/js/
│   ├── service-worker.js          # Service worker
│   └── newsblur/mobile/
│       └── mobile_reader.js       # Mobile app
├── public/
│   └── manifest.webmanifest       # PWA manifest
├── apps/reader/
│   ├── urls.py                    # Added /mobile/ route
│   └── views.py                   # Added mobile() view
├── apps/static/
│   └── views.py                   # Updated manifest serving
└── deploy-mobile-pwa.sh           # Deployment script (this one)
```

---

## Rollback (if needed)

If something goes wrong, rollback with:

```bash
cd /path/to/NewsBlurCustom
git revert HEAD~4  # Revert the 4 mobile PWA commits
git push origin main
python manage.py collectstatic --noinput
sudo supervisorctl restart newsblur
```

Or go back to a known good commit:

```bash
git checkout d0162d4e0  # Before mobile PWA
git push origin main --force
```

---

## Architecture

The mobile PWA uses:

- **Frontend**: Backbone.js (existing framework, no new dependencies)
- **Styling**: CSS variables for theming, media queries for responsiveness
- **Offline**: Service worker with network-first API caching
- **Caching**: Network-first for APIs, cache-first for assets
- **PWA**: Manifest for app installation, standalone display mode

No new backend dependencies or database changes needed.

---

**Status: Ready for Deployment** ✅

Run `bash deploy-mobile-pwa.sh` on your server to get started!
