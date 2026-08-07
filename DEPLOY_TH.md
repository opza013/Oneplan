# ONE PLAN v5.4.14 — Deploy

เวอร์ชันนี้ปรับหน้า Master Data ให้ทำงานสะดวกขึ้นโดยจัดกลุ่มใหม่ตามลำดับการใช้งาน และเปลี่ยนปุ่มปิด Expanded View เป็น X

1. สำรอง `oneplan-state.json` หรือ Export JSON ก่อน Deploy หากมีข้อมูลใช้งานจริง
2. แตก ZIP และอัปโหลดไฟล์ทั้งหมดไว้ที่ GitHub Repository Root โดยตรง
3. Commit การเปลี่ยนแปลง
4. Render → Manual Deploy → Clear build cache & deploy
5. เปิด `/api/health` และตรวจ Version เป็น `5.4.14-detail-gantt-milestone-scale`
6. เปิดหน้า App แล้วกด `Ctrl + Shift + R` หนึ่งครั้ง

## Master Data Layout
- Row 1: Key Milestone Master
- Row 2: Event Type Master / Task Master / NWT Master
- Row 3: Store Master / Capacity Model
- Bottom: Role Permissions

## Expand View
- ก่อนขยาย: ปุ่ม `Expand`
- หลังขยาย: แสดงปุ่ม `X` เท่านั้นสำหรับปิดและกลับสู่ Layout ปกติ
- ยังกด `Esc` หรือคลิกพื้นหลังเพื่อปิดได้

## Data
ไม่ต้อง Reset Data และไม่มีการเปลี่ยน schema ของ Event, Task, NWT, Key Milestone, PIC หรือ Project Activity ในเวอร์ชันนี้
