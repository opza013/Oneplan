# ONE PLAN v5.4.12 — Event Type Master

Enterprise Range Operation Platform.

## v5.4.12
- Create/Edit Plan uses **Event Code / Event Name / Event Type** labels.
- **Master Data → Event Type Master** controls available Event Types.
- Admin can add, delete, and reorder Event Types.
- In-use Event Types cannot be deleted.
- Existing saved data is migrated automatically; no storage reset is required.
- Includes all v5.4.11 functionality, including expandable Master Data workspaces.

## Deploy
Upload all files to the GitHub repository root and redeploy the Render Web Service.
After deployment, `/api/health` should report `5.4.12-event-type-master`.
