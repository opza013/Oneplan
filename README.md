# ONE PLAN — Direct Root Render Package

This package intentionally has no wrapper folder and no `public/` directory.
Upload every file directly to the GitHub repository root.

Required GitHub root files:

- `index.html`
- `server.js`
- `package.json`
- `render.yaml`

## Recommended Render setup

Create **New > Web Service** and connect the repository.

- Runtime: Node
- Build Command: `npm install --omit=dev`
- Start Command: `npm start`
- Health Check Path: `/api/health`
- Instance: Free

After deploy, test `/api/health` before opening `/`.


## v5.1.0 — Gantt milestone read-only detail

- Click any milestone box in the main Gantt Chart to open a read-only detail popup.
- The popup shows project, owner, dependency, planned/actual dates, status and Next Steps.
- Editing is intentionally disabled in the Gantt popup.
- Use **Open Detail Plan to Edit** to change milestone dates or Next Steps.
