# OnePlan Render — Fixed Root Deployment

This package removes the nested-folder ambiguity that can cause Render to deploy an empty publish directory.

## Required GitHub repository structure

Upload these files directly to the repository root:

```text
index.html
render.yaml
README.md
.gitignore
```

Do not upload the containing folder as an additional nested level.

## Existing Render Static Site

In **Settings > Build & Deploy** set:

- Root Directory: blank
- Build Command: `echo "OnePlan static site ready"`
- Publish Directory: `.`
- Branch: `main`

Then choose **Manual Deploy > Clear build cache & deploy**.

## Blueprint deployment

Create a Blueprint from this repository. Render will read `render.yaml` from the repository root.
