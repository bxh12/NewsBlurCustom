# NewsBlur Migration Summary

**Date**: 2026-04-22
**From**: `.openclaw/workspace/NewsBlurCustom`
**To**: `/home/bxh/NewsBlur`

## What Happened

1. ✅ Moved active instance to `/home/bxh/NewsBlur`
2. ✅ Migrated all data volumes (PostgreSQL, MongoDB, Redis, Elasticsearch)
3. ✅ Removed .git from home version to enable separate container names
4. ✅ Fixed port bindings to use localhost instead of Tailscale IP
5. ✅ All 12 services running and healthy

## Accessing Your Instance

- **Web UI**: https://localhost (accept self-signed cert)
- **Docker location**: /home/bxh/NewsBlur
- **Data**: docker/volumes/

## Sunsetted Instance

The openclaw version is no longer active. A backup exists as `NewsBlur-openclaw-backup-*.tar.gz` for reference.
