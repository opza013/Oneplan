# OnePlan Cloud Starter — GitHub + Render

This repository packages the current OnePlan single-file application for deployment as a Render Static Site.

## Current scope

- The application UI and existing business logic are preserved.
- Render hosts the application over HTTPS.
- GitHub is the source-control repository.
- Every push to the deployed branch can trigger an automatic Render deployment.
- Application data still uses browser `localStorage` in this starter phase.

> Important: This phase provides cloud hosting, not a shared cloud database. Data entered on one browser/device is not automatically shared with another browser/device.

## Repository structure

```text
.
├── public/
│   └── index.html       # Current OnePlan application
├── docs/
│   └── CLOUD_ROADMAP.md
├── render.yaml          # Render Blueprint configuration
├── .gitignore
└── README.md
```

## Deploy with GitHub and Render

### 1. Create the GitHub repository

Create a new repository, for example:

```text
oneplan-cloud
```

Upload all files from this folder to the repository root, or use Git:

```bash
git init
git add .
git commit -m "Prepare OnePlan for Render static deployment"
git branch -M main
git remote add origin https://github.com/<YOUR-ACCOUNT>/oneplan-cloud.git
git push -u origin main
```

### 2. Deploy on Render

Option A — Blueprint:

1. Open Render Dashboard.
2. Select **New > Blueprint**.
3. Connect the GitHub repository.
4. Render reads `render.yaml`.
5. Confirm the service and deploy.

Option B — Static Site:

1. Select **New > Static Site**.
2. Connect the GitHub repository.
3. Branch: `main`.
4. Build Command: `echo "OnePlan static build completed"`.
5. Publish Directory: `public`.
6. Create the site.

## Updating OnePlan

Replace or edit `public/index.html`, then commit and push:

```bash
git add public/index.html
git commit -m "Update OnePlan application"
git push
```

Render will deploy the updated commit when auto-deploy is enabled.

## Data backup during the starter phase

Because the current application uses browser `localStorage`:

1. Export OnePlan JSON regularly from the application.
2. Keep a dated backup outside the browser.
3. Import the JSON when moving to another browser/device.
4. Do not treat local browser data as a central production database.

## Recommended next phase

Add a Render Web Service API and PostgreSQL database, then replace direct `localStorage` persistence with authenticated API calls. See `docs/CLOUD_ROADMAP.md`.
