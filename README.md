# ONE PLAN v5.4.2 — Equal-height Dashboard

This package preserves all v5.4.1 functions and applies two focused dashboard changes:

1. Cards in the same dashboard row use equal heights. Main-row cards use one shared height; the three lower cards use another shared height. Long milestone lists scroll inside the card instead of increasing the row height.
2. Workload **Current** displays the current week together with the following 6 weeks (7 weeks total). Previous and Next 6 Weeks remain available as separate views.

## Deploy
Upload all files to the GitHub repository root, then use Render **Manual Deploy → Clear build cache & deploy**.

Verify `/api/health` reports `5.4.2-equal-height-workload`.
