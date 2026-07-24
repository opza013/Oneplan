# ONE PLAN — RANGE OPERATION PLATFORM

Complete rebuild package for GitHub + Render.

## Included in this build

- Node.js Web Service for Render
- Shared server JSON state (`GET/PUT /api/state`)
- Browser local cache and offline fallback
- Automatic cloud synchronization
- Revision conflict protection and Force Save
- Atomic state writes and versioned server backups
- Optional `STATE_TOKEN`
- Detail Plan with project Gantt
- Today navigation and milestone side panel
- Editable milestone Planned Start / Planned End
- Stacked Activity Next Steps with add/edit/delete
- Save button dirty-state logic and delete confirmation
- Searchable multi-select filters
- Compact but readable milestone rows
- ONE PLAN / RANGE OPERATION PLATFORM branding
- Implementation Load stacked by RCPM, RCA, Display, Store Ops, and Merch
- Asynchronous workload calculation to prevent Windows freezing

## Repository structure

Upload the contents of this ZIP to the GitHub repository root exactly as shown:

```text
public/
  index.html
server.js
package.json
render.yaml
README.md
DEPLOY_CHECKLIST_TH.md
VERSION.txt
data/
  README.md
test/
  validate-inline.mjs
  smoke.mjs
```

`public/index.html` is the application. Do not move it to the repository root.

## Render deployment

This build must be deployed as a **Node Web Service**, not a Static Site.

Recommended method:

1. Push all files to GitHub.
2. In Render, select **New > Blueprint**.
3. Connect the GitHub repository.
4. Render reads `render.yaml` and creates:
   - Node Web Service
   - 1 GB persistent disk mounted at `/var/data`
   - Health check at `/api/health`
5. Set `STATE_TOKEN` when prompted. Keep this value private.
6. Deploy and wait for the service status to become Live.
7. Open `/api/health` and confirm a JSON response.
8. Open OnePlan > Settings > Cloud State Storage.
9. Enter the same State Token and select **Save Token & Connect**.

## First data synchronization

Open the application first on the browser that contains the latest OnePlan local data. When the cloud state is empty, OnePlan can upload the local state to the server. Download a local backup before the first synchronization when the data is important.

## Storage architecture

```text
Browser local cache
        ↓ auto-sync
Node state API
        ↓ atomic write
/var/data/oneplan-state.json
        ↓ backup before overwrite
/var/data/backups/
```

The persistent disk is required because the ordinary Render service filesystem is temporary.

## Local validation

```bash
npm test
npm start
```

Then open:

```text
http://localhost:3000
http://localhost:3000/api/health
```

For local testing without authentication, leave `STATE_TOKEN` unset.
