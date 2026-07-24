# OnePlan Cloud Storage — AI Radar Architecture

This version replaces browser-only storage and the SharePoint add-on with the same storage pattern used by the AI Radar app:

- Immediate browser `localStorage` cache for fast startup and offline safety
- Shared server JSON state through `GET/PUT /api/state`
- Automatic debounced cloud save after every OnePlan change
- Revision-based optimistic concurrency to block silent overwrite
- Atomic server writes and automatic versioned backups
- Optional `STATE_TOKEN` protection
- Auto-check when the browser returns online or regains focus

## Important deployment change

This is no longer a Render Static Site. It must run as a **Node Web Service**. The supplied `render.yaml` includes a 1 GB persistent disk mounted at `/var/data`.

## GitHub structure

Upload these items to the repository root:

```
public/index.html
server.js
package.json
render.yaml
data/.keep
test/validate-inline.mjs
test/smoke.mjs
```

## Render deployment

1. Commit this package to GitHub.
2. In Render, create a new **Blueprint** or **Web Service** from the repository. Do not reuse the old Static Site as the final production service.
3. During Blueprint creation, set `STATE_TOKEN` to a private value.
4. Deploy.
5. Open OnePlan > Settings > Cloud State Storage, enter the same token, then select **Save Token & Connect**.
6. Open the app first on the Windows browser that contains the latest OnePlan local data. If the cloud file is empty, that data is uploaded automatically.

## Migration safety

Before every cloud pull, OnePlan keeps a browser backup under `onePlanV3StoreMaster_StoragePathSetting_beforeCloudPull`. Use **Restore Before-Pull Cache** in Settings when needed.

## Validate locally

```bash
npm test
npm start
```

Open `http://localhost:3000`. For local use without a token, leave `STATE_TOKEN` unset.

## Dashboard update — Implementation Load

Only the **Implementation Load** dashboard card was changed in this release.

- Replaced the single weekly utilization bar with a stacked workload bar by team.
- Teams shown: RCPM, RCA, Display, Store Ops, and Merch.
- Weekly load is derived from planned milestone dates, project type, and project scale.
- The total above each bar is planned cross-functional workload versus the combined weekly team-capacity index.
- Hovering a segment shows that team's utilization and active milestone count.
- Previous week, current week, and next six weeks remain unchanged.

All cloud storage, sync, conflict protection, filters, Detail Plan, Gantt, Next Steps, and milestone popups remain unchanged.

## Responsiveness fix — Implementation Load

The team-stack chart now renders asynchronously after the dashboard shell is visible. Workload is calculated in one pass across the visible eight-week window rather than rescanning every project for each week. Invalid milestone dates are skipped safely, and a chart calculation error no longer blocks the rest of the dashboard.
