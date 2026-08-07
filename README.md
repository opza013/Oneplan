# ONE PLAN v5.4.4 — Task / Sub Task / Key Milestone

## New
- Admin can configure the Gantt color of every Key Milestone in Master Data.
- Project schedule now uses `Task → Sub Task / Phase → Key Milestone`.
- A milestone code can be repeated multiple times in one project using unique activity IDs.
- Supports parallel phases such as POG Phase 1/2/3 and Floorplan Phase 1/2/3.
- Detail Gantt shows one activity lane per Task/Sub Task/Milestone.
- All-project Gantt automatically stacks overlapping activities.
- Existing v5.4.3 data is migrated automatically with Task/Sub Task defaults.

Deploy all files to GitHub root and use Render Clear build cache & deploy. Verify `/api/health` = `5.4.4-task-subtask-milestone`.
