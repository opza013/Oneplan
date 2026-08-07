# OnePlan v5.4.12 — Event Type Master

- Renamed Create/Edit Plan identity labels to **Event Code**, **Event Name**, and **Event Type**.
- Added **Event Type Master** in Master Data for Admin-controlled add, delete, and ordering.
- Event Type dropdown and Type filter now read from Event Type Master.
- Event Type deletion is blocked while the type is used by an existing plan.
- Existing project `type` values are migrated into Event Type Master automatically for backward compatibility.
- Event Type Master is included in local cache, device-folder storage, cloud state, backup, import/export, and reset flows.
- Preserves v5.4.11 Master Data Expand/Restore workspace behavior and all prior Task/NWT/Key Milestone functionality.
