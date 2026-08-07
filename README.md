# ONE PLAN v5.4.6 — Task Master Dropdown

Enterprise Range Operation Platform.

## Update
- **Master Data → Task Master**: Admin can add, edit, reorder and delete Task values.
- **Task** is now selected from a Master Data dropdown in Project Schedule and Detail Plan.
- **Sub Task / Phase remains free form** for project-specific phases such as Phase 1 / 2 / 3.
- Task deletion is blocked while in use; renaming updates linked project activities.
- Existing Task values are preserved and auto-migrated into Task Master.
- Key Milestone colors/order, Gantt sorting and Task → Sub Task → Key Milestone structure remain available.

Deploy to the existing Render Node Web Service and verify `/api/health` reports `5.4.6-task-master-dropdown`.
