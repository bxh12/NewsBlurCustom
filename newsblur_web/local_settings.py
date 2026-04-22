"""Local overrides for this self-hosted instance.

This file is intentionally *not* tracked upstream in the default NewsBlur repo.
It overrides settings from newsblur_web/docker_local_settings.py.

Goal: make the instance usable over Tailscale MagicDNS.
"""

NEWSBLUR_URL = "https://beelink-ubuntu.tail624886.ts.net"
SESSION_COOKIE_DOMAIN = "beelink-ubuntu.tail624886.ts.net"
PUSH_DOMAIN = "beelink-ubuntu.tail624886.ts.net"

# Self-hosted deployments generally don't want NewsBlur's username-subdomain
# routing (e.g. username.newsblur.com). This also avoids redirects when using
# Tailscale MagicDNS hostnames.
DISABLE_SUBDOMAINS = True

# -----------------------
# Home "production" mode
# -----------------------
# Reduce verbosity/overhead and behave more like a real deployment.
DEBUG = False
DEBUG_ASSETS = False
DEBUG_QUERIES = False
DEBUG_QUERIES_SUMMARY_ONLY = True

# Don’t enable upstream Sentry by accident.
SENTRY_DSN = None
FLASK_SENTRY_DSN = None

# Required for cookie signing.
# If you ever rotate this, all sessions will be invalidated.
SECRET_KEY = "wzQ3tBPBa57l2bVHllkyVq-qMTq2EYXBNRptd50Xt2WFy4S8373mZOU4KPR7oLFnsijY1u7ON1bTiM7zWg4zdQ"

# We terminate TLS at HAProxy. Tell Django to trust the forwarded proto/host.
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
USE_X_FORWARDED_HOST = True

# Avoid CSRF issues when posting over HTTPS on your MagicDNS hostname.
CSRF_TRUSTED_ORIGINS = [
    "https://beelink-ubuntu.tail624886.ts.net",
    "https://100.94.165.14",
    "https://localhost",
]

SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
