# ONE PLAN v5.4.10 — Key Milestone Multi-PIC Responsibility

This version moves NWT responsibility assignment into **Key Milestone Master**. Each Key Milestone can have one or more PIC / Responsible Units selected from NWT Master, with Add/Remove controls.

In Detail Plan, the responsible units are inherited from the selected Key Milestone and cannot be redefined at activity level. The individual responsible person name for each PIC unit remains free-form per activity. Existing v5.4.9 data is migrated automatically; no storage reset is required.

Upload all files to the GitHub repository root and deploy the existing Render Node Web Service. Verify `/api/health` reports `5.4.10-milestone-multi-pic`.
