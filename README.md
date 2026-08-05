# ONE PLAN v5.4.3 — Row-level Dashboard Alignment

## Changes
- Fixed the legacy `.card + .card` margin that pushed the second and third cards down inside dashboard grids.
- KPI cards, Workload / Project Status, and the three lower dashboard cards now share the same top and bottom level within each row.
- Workload **Current** continues to show the current week plus the next 6 weeks (7 weeks total).
- All v5.4.2 functions and storage behavior remain unchanged.

## Deploy
Upload all files to the GitHub repository root, then run **Clear build cache & deploy** in Render.
Verify `/api/health` reports `5.4.3-row-level-alignment`.
