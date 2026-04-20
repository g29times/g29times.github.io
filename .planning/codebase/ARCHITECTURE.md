# ARCHITECTURE.md
- **Core**: Vite (React) for frontend, Cloudflare Workers for backend API (D1 DB).
- **Frontend Framework**: Shadcn/UI for components, Tailwind CSS for styling.
- **Data Persistence**: Cloudflare D1 for DailyLog logs and blog metadata; GitHub Pages for hosting.
- **Communication**: Inter-process bus via JSON files in `/bus/` and Redis/Upstash for cross-agent signaling.
- **Integration**: `post_blog.py` for API sync; `gsd-tools` for workflow automation.
