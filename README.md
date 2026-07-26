# ONE PLAN — Device Folder Storage v5.3

This build stores the OnePlan state in a folder selected from the user's computer through the browser folder picker.

## Files created in the selected folder
- `oneplan-state.json` — active application state
- `backups/` — automatic and manual JSON backups (maximum 20)

## Browser requirement
Use Microsoft Edge or Google Chrome on Windows through the Render HTTPS URL. The browser requires the user to choose the folder and grant read/write permission. The app can display the selected folder name, but browsers do not expose the full absolute Windows path.

## Deploy
Upload all files to the GitHub repository root and deploy as a Render Node Web Service. The Render server only hosts the app; the primary OnePlan data file is written to the folder selected on each device.
