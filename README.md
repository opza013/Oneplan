# ONE PLAN v5.4.9 — NWT Master Order Fix

Fixes NWT Master ordering so Admin can change Display Order reliably. Adds Move Up / Move Down controls and ensures the saved order is immediately used by NWT dropdowns throughout Project Plan and Detail Plan.

Existing v5.4.8 data is compatible; no storage reset is required.

Upload all files to the GitHub repository root and deploy the existing Render Node Web Service. Verify `/api/health` reports `5.4.9-nwt-order-fix`.
