# ONE PLAN — Storage Path Select v5.2

Direct-root Node Web Service package for GitHub and Render.
Upload all files directly to the GitHub repository root.

## Added in v5.2

- Select the server storage directory from **Settings > Server Storage Path**.
- Available modes: Temporary, Application data folder, Render persistent disk (`/var/data`), and Custom directory.
- Write-permission test before switching.
- Optional migration of the current state and revision to the new path.
- Protection against accidentally overwriting an existing target state.
- The Gantt milestone popup remains read-only; editing is available only in Detail Plan.

## Required root files

- `index.html`
- `server.js`
- `package.json`
- `package-lock.json`
- `render.yaml`

## Render

Create a Node **Web Service**.

- Build Command: `npm install --omit=dev`
- Start Command: `npm start`
- Health Check Path: `/api/health`

For persistent storage, attach a Render disk mounted at `/var/data`, then select **Render persistent disk** inside OnePlan Settings. Without a disk, the Free service filesystem is temporary.
