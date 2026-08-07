# ONE PLAN v5.4.15 — Detail Plan Gantt Expand & Zoom

Enterprise Master Data workspace update. Key Milestone Master is prioritized at the top, governance masters are grouped together, operational masters share a row, and Role Permissions remains at the bottom. Expanded cards close with an X-only control.

## Deploy
Upload all files to the GitHub repository root and deploy the existing Render Node Web Service.

Health check version: `5.4.15-detail-gantt-expand-zoom`.

## Detail Plan Gantt readability
- Key Milestone bars: +100% height in Detail Plan Gantt only.
- Key Milestone text: +50% in Detail Plan Gantt only.
- Main Gantt sizing is unchanged.


## v5.4.15 Detail Plan Gantt controls
- Adds an **Expand** button inside the Detail Plan Project Gantt only.
- Expanded Gantt uses a large temporary overlay and closes with **X**.
- Adds **− / 100% / +** zoom controls directly inside the Detail Plan Gantt header.
- Zoom range remains 50%–250%, preserving horizontal center during zoom.
- Main Gantt Chart is unchanged.
