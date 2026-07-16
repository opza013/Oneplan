# OnePlan Render — Windows Performance Build

Upload these files to the root of the GitHub repository.

## Fixes
- Precomputed weekly store workload index.
- Store Capacity table paginated at 50 rows per page.
- Debounced global search.
- Removed duplicate startup render.
- Added diagnostic URLs:
  - `?fresh=1` ignores existing browser data without deleting it.
  - `?reset=1` clears the OnePlan browser cache and loads base data.

## Render settings
- Root Directory: blank
- Publish Directory: `.`
- After committing, use **Clear build cache & deploy**.
