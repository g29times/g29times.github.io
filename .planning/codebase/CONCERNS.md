# CONCERNS.md
- **API Reliability**: Direct API access via `api.aimmar.ink` is sensitive to network configurations.
- **Environment**: Lightning.AI Studio environment has strict process/daemon management constraints.
- **Bus Congestion**: 60s polling interval is a temporary fallback; event-based (inotify/Redis) notification is preferred.
- **Security**: Hardcoded R2/Upstash tokens in local files need audit; consider using CF secrets.
- **Workflow State**: Stalled cron jobs indicate trigger reliability issues.
