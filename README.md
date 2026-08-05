# ONE PLAN v5.4.1 — Enterprise Fix Pack

This package preserves the v5.4 enterprise interface and adds the requested fixes:

1. Admin-controlled main-menu visibility in Settings. Dashboard and Settings remain available.
2. Dashboard Period context typography increased by 50%.
3. Dashboard card rows aligned to equal height. “Implementation Load” renamed to “Workload” with Previous / Current / Next 6 Weeks selection.
4. Gantt Today action moves active-today projects to the first rows and scrolls to the Today marker.
5. Gantt and Store Capacity zoom controls work with reset behavior.
6. Gantt and Store Capacity line/font sizes scale with zoom density.
7. Dashboard no longer embeds the Gantt; the timeline remains in the Gantt Chart menu.

## Deploy
Upload all files to the GitHub repository root, then use Render **Manual Deploy → Clear build cache & deploy**.

Verify `/api/health` reports `5.4.1-enterprise-fixes`.
