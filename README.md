# ONE PLAN v5.4.7 — NWT Master & Activity Responsibility

This build extends v5.4.6 with an NWT / Responsible Unit master.

## New
- Master Data → NWT Master: Admin can add/edit/reorder/delete responsible units.
- Detail Plan activity: select NWT from Master and type PIC / Responsible Person as free-form text.
- Project activity editor uses the same model.
- Existing activity data is migrated automatically.

## Deploy
Upload all files to the GitHub repository root and deploy the existing Render Node Web Service. Verify `/api/health` reports `5.4.7-nwt-master-responsibility`.
