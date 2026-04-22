import logging
import os

# ===================
# = Server Settings =
# ===================

ADMINS = (("Samuel Clay", "samuel@newsblur.com"),)

SERVER_EMAIL = "server@newsblur.com"
HELLO_EMAIL = "hello@newsblur.com"
NEWSBLUR_URL = "https://beelink-ubuntu.tail624886.ts.net"
PUSH_DOMAIN = "beelink-ubuntu.tail624886.ts.net"
SESSION_COOKIE_DOMAIN = "beelink-ubuntu.tail624886.ts.net"
DISABLE_SUBDOMAINS = True

# ===================
# = Global Settings =
# ===================

DOCKERBUILD = True
DEBUG = False
DEBUG = True

# DEBUG_ASSETS controls JS/CSS asset packaging. Turning this off requires you to run
# `./manage.py collectstatic` first. Turn this on for development so you can see
# changes in your JS/CSS.
DEBUG_ASSETS = False  # Make sure to run `./manage.py collectstatic` first
DEBUG_ASSETS = True

# DEBUG_QUERIES controls the output of the database query logs. Can be rather verbose
# but is useful to catch slow running queries. A summary is also useful in cutting
# down verbosity.
DEBUG_QUERIES = DEBUG
DEBUG_QUERIES_SUMMARY_ONLY = True
DEBUG_QUERIES_SUMMARY_ONLY = False

MEDIA_URL = "/media/"
IMAGES_URL = "/imageproxy"
# Uncomment below to debug iOS/Android widget
# IMAGES_URL = 'https://haproxy/imageproxy'
SECRET_KEY = "YOUR SECRET KEY"
AUTO_PREMIUM_NEW_USERS = True
AUTO_PREMIUM_ARCHIVE_NEW_USERS = True
AUTO_PREMIUM_PRO_NEW_USERS = True
AUTO_PREMIUM = True
SELF_HOSTED_ALL_PREMIUM = True
# AUTO_PREMIUM = False
if not AUTO_PREMIUM:
    AUTO_PREMIUM_NEW_USERS = False
    AUTO_PREMIUM_ARCHIVE_NEW_USERS = False
    AUTO_PREMIUM_PRO_NEW_USERS = False
AUTO_ENABLE_NEW_USERS = True
ENFORCE_SIGNUP_CAPTCHA = False

# Push notifications
# Enable by default for self-hosted installs; requires APNS key + IDs to actually deliver iOS pushes.
ENABLE_PUSH = True

PRO_MINUTES_BETWEEN_FETCHES = 15

CACHES = {
    "default": {
        "BACKEND": "django_redis.cache.RedisCache",
        "LOCATION": "redis://newsblur_db_redis:6579/6",
    },
}

EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"

# Set this to the username that is shown on the homepage to unauthenticated users.
HOMEPAGE_USERNAME = "popular"

# Default username for dev autologin (only works when DEBUG=True)
DEV_AUTOLOGIN_USERNAME = "samuel"

# Google Reader OAuth API Keys
OAUTH_KEY = "www.example.com"
OAUTH_SECRET = "SECRET_KEY_FROM_GOOGLE"

S3_ACCESS_KEY = "XXX"
S3_SECRET = "SECRET"
S3_BACKUP_BUCKET = "newsblur-backups"
S3_PAGES_BUCKET_NAME = "pages-XXX.newsblur.com"
S3_ICONS_BUCKET_NAME = "icons-XXX.newsblur.com"
S3_AVATARS_BUCKET_NAME = "avatars-XXX.newsblur.com"

STRIPE_SECRET = "YOUR-SECRET-API-KEY"
STRIPE_PUBLISHABLE = "YOUR-PUBLISHABLE-API-KEY"

# ===============
# = Social APIs =
# ===============

FACEBOOK_APP_ID = "111111111111111"
FACEBOOK_SECRET = "99999999999999999999999999999999"
TWITTER_CONSUMER_KEY = "ooooooooooooooooooooo"
TWITTER_CONSUMER_SECRET = "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
YOUTUBE_API_KEY = "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"

# =============
# = Databases =
# =============

DATABASES = {
    "default": {
        "NAME": "newsblur",
        "ENGINE": "django_prometheus.db.backends.postgresql",
        #'ENGINE': 'django.db.backends.mysql',
        "USER": "newsblur",
        "PASSWORD": "newsblur",
        "HOST": "newsblur_db_postgres",
        "PORT": 5432,
    },
}

MONGO_DB = {"name": "newsblur", "host": "newsblur_db_mongo:29019"}
MONGO_ANALYTICS_DB = {
    "name": "nbanalytics",
    "host": "newsblur_db_mongo:29019",
}

MONGODB_SLAVE = {"host": "newsblur_db_mongo"}

# Celery RabbitMQ/Redis Broker
BROKER_URL = "redis://newsblur_db_redis:6579/0"
CELERY_RESULT_BACKEND = BROKER_URL
CELERY_WORKER_CONCURRENCY = 1

REDIS_USER = {"host": "newsblur_db_redis", "port": 6579}
REDIS_PUBSUB = {"host": "newsblur_db_redis", "port": 6579}
REDIS_STORY = {"host": "newsblur_db_redis", "port": 6579}
REDIS_SESSIONS = {"host": "newsblur_db_redis", "port": 6579}

CELERY_REDIS_DB_NUM = 4
SESSION_REDIS_DB = 5

ELASTICSEARCH_FEED_HOSTS = ["newsblur_db_elasticsearch:9200"]
ELASTICSEARCH_STORY_HOSTS = ["newsblur_db_elasticsearch:9200"]
ELASTICSEARCH_DISCOVER_HOSTS = ["newsblur_db_elasticsearch:9200"]

ELASTICSEARCH_FEED_HOST = "http://newsblur_db_elasticsearch:9200"
ELASTICSEARCH_STORY_HOST = "http://newsblur_db_elasticsearch:9200"
ELASTICSEARCH_DISCOVER_HOST = "http://newsblur_db_elasticsearch:9200"
BACKED_BY_AWS = {
    "pages_on_node": False,
    "pages_on_s3": False,
    "icons_on_s3": False,
}

# AI Provider API Keys
# Prefer environment variables so secrets don't live in the repo.
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "sk-svcacct-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX")
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "sk-ant-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX")
GOOGLE_GEMINI_API_KEY = os.getenv("GOOGLE_GEMINI_API_KEY", "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX")
XAI_API_KEY = os.getenv("XAI_API_KEY", "")

# Ask AI default model.
# Prefer Gemini if a non-placeholder key is configured, otherwise fall back to the upstream default.
_gemini_key = GOOGLE_GEMINI_API_KEY or ""
_gemini_configured = (
    len(_gemini_key) > 20
    and "XXXX" not in _gemini_key
    and "XXX" not in _gemini_key
)
_ask_ai_model_env = os.getenv("ASK_AI_MODEL")
ASK_AI_MODEL = (
    _ask_ai_model_env
    if _ask_ai_model_env
    else ("gemini-3" if _gemini_configured else "opus")
)

_briefing_model_env = os.getenv("BRIEFING_MODEL")
BRIEFING_MODEL = (
    _briefing_model_env
    if _briefing_model_env
    else ("gemini-flash-lite" if _gemini_configured else "haiku")
)  # Options: haiku, gpt-5-mini, gemini-flash-lite, grok-4.1-fast

# ===========
# = Logging =
# ===========

# Logging (setup for development)
LOG_TO_STREAM = True

if len(logging._handlerList) < 1:
    LOG_FILE = "~/newsblur/logs/development.log"
    logging.basicConfig(
        level=logging.DEBUG,
        format="%(asctime)-12s: %(message)s",
        datefmt="%b %d %H:%M:%S",
        handler=logging.StreamHandler,
    )

MAILGUN_ACCESS_KEY = "key-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
MAILGUN_SERVER_NAME = "newsblur.com"

DO_TOKEN_LOG = "0000000000000000000000000000000000000000000000000000000000000000"
DO_TOKEN_FABRIC = "0000000000000000000000000000000000000000000000000000000000000000"

SERVER_NAME = "nblocalhost"
NEWSBLUR_URL = os.getenv("NEWSBLUR_URL", "https://beelink-ubuntu.tail624886.ts.net")

if NEWSBLUR_URL == "https://beelink-ubuntu.tail624886.ts.net":
    SESSION_COOKIE_DOMAIN = "beelink-ubuntu.tail624886.ts.net"

SESSION_ENGINE = "redis_sessions.session"
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
USE_X_FORWARDED_HOST = True
CSRF_TRUSTED_ORIGINS = [
    "https://beelink-ubuntu.tail624886.ts.net",
    "https://100.94.165.14",
]
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True

# CORS_ORIGIN_REGEX_WHITELIST = ('^(https?://)?(\w+\.)?nb.local\.com$', )

RECAPTCHA_SECRET_KEY = "0000000000000000000000000000000000000000"
IMAGES_SECRET_KEY = "0000000000000000000000000000000"

# APNS settings for token-based authentication
APNS_TEAM_ID = "XXXXXXXXXX"  # Apple Developer Team ID (10 characters)
APNS_KEY_ID = "XXXXXXXXXX"  # APNS Key ID (10 characters)
