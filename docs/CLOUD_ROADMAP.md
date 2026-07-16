# OnePlan Cloud Roadmap

## Phase 1 — GitHub + Render Static Site

Purpose: Put the current stable OnePlan version online with controlled source code and repeatable deployment.

Components:

- GitHub repository
- Render Static Site
- Current `public/index.html`
- Browser `localStorage`
- Manual JSON backup/import

Limitations:

- No central database
- No real multi-user synchronization
- No user authentication
- Browser data can be lost if storage is cleared
- Separate devices have separate data

## Phase 2 — Render API + PostgreSQL

Recommended architecture:

```text
Browser
  |
  v
Render Static Site (OnePlan Frontend)
  |
  | HTTPS / JSON API
  v
Render Web Service (Node.js API)
  |
  v
Render PostgreSQL
```

Initial API scope:

- `GET /api/state`
- `PUT /api/state`
- `GET /api/projects`
- `POST /api/projects`
- `PATCH /api/projects/:id`
- `DELETE /api/projects/:id`
- `GET /api/stores`
- `POST /api/import`
- `GET /api/export`

Minimum database tables:

- users
- roles
- projects
- project_stores
- milestone_master
- project_milestones
- stores
- settings
- audit_logs

## Phase 3 — Multi-user governance

- Authentication
- Role-based access
- Record ownership
- Approval workflow
- Audit trail
- Optimistic concurrency/version checking
- Notifications
- Scheduled backups

## Recommended migration sequence

1. Keep the current `localStorage` version as a fallback.
2. Add an API client layer without changing the UI.
3. Save/load the complete OnePlan state through one API endpoint first.
4. Validate cloud persistence and restore behavior.
5. Split the state into normalized project, store, milestone, and settings APIs.
6. Add authentication and role control.
7. Add audit logs and approval workflow.

## Acceptance criteria for Phase 1

- OnePlan opens through a Render HTTPS URL.
- Core menus and Gantt render correctly.
- Existing local data functions still work.
- JSON export/import works.
- A GitHub push triggers a new deployment.
- The previous successful Render deploy can be restored if a new version fails.
