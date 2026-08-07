# ONE PLAN v5.4.5

**Gantt Sort + Detail Plan Structure Management**

- Gantt default sort follows Key Milestone Master Display Order.
- Users can switch Gantt sorting to Task/Sub Task, Planned Start, Live Week, Project Name, or Owner.
- Detail Plan can add/edit/delete Task → Sub Task → Key Milestone hierarchy directly.
- Key Milestone Master now includes Display Order used by the Gantt default.
- Existing v5.4.4 data migrates automatically; no storage reset is required.

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
