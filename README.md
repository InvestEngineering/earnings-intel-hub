# Earnings Intelligence Hub

Earnings Intelligence Hub (repo: `earnings-intel-hub`) is a static index that organizes interactive earnings forecast HTML reports and keeps report notes per report.

What it contains

- `index.html` — landing page that lists reports from `reports/reports.json`.
- `reports/` — store all interactive HTML reports here (single source of truth).
- `prompts/` — Markdown files (`<basename>.md`) with prompt notes for each report.
- `scripts/generateReportsJson.js` — scans `reports/` and emits `reports/reports.json` used by the index.
- `.github/workflows/deploy.yml` — runs generator and deploys to GitHub Pages on push.

Quick start

```bash
# regenerate metadata
npm run generate-reports

# quick local preview
python3 -m http.server 8001
# open http://localhost:8001 in your browser
```

Usage conventions

- Add full report HTML files to `reports/`. The generator pulls `title`, `description`, `og:image` (if present), and `keywords`/`data-tags`.
- Put prompt notes in `prompts/<report-basename>.md` (e.g. `prompts/aarti_pharmalabs_earnings_intelligence_spa.md`).
- Keep the repository root tidy; reports belong under `reports/`.

Deployment

1. Push to GitHub.
2. The included GitHub Actions workflow runs `npm run generate-reports` and publishes the site to GitHub Pages on the `main` or `master` branch.

Next steps I can help with

- Commit & push these changes and enable GitHub Pages.
- Add repo-level CI checks (accessibility, link validation).
- Add a small admin UI to edit prompts in-place.

Tell me if you want me to commit and push these updates and rename the repo slug to `earnings-intel-hub`.
