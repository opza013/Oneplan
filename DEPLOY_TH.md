# ONE PLAN v5.4.10 — Deploy

เวอร์ชันนี้ย้ายการกำหนด NWT/PIC Unit ไปไว้ใน Key Milestone Master และรองรับหลาย PIC ต่อ Key Milestone

1. สำรอง `oneplan-state.json` หรือ Export JSON ก่อน Deploy หากมีข้อมูลใช้งานจริง
2. แตก ZIP และอัปโหลดไฟล์ทั้งหมดไว้ที่ GitHub Repository Root โดยตรง
3. Commit การเปลี่ยนแปลง
4. Render → Manual Deploy → Clear build cache & deploy
5. เปิด `/api/health` และตรวจ Version เป็น `5.4.10-milestone-multi-pic`
6. เปิดหน้า App แล้วกด `Ctrl + Shift + R` หนึ่งครั้ง

## ไม่ต้อง Reset Data
ข้อมูล v5.4.9 เดิมจะ migrate อัตโนมัติจาก NWT/PIC แบบรายการเดียวไปเป็น Responsibility List และคง Next Steps / Dates / Project Structure เดิมไว้

## ฟังก์ชันใหม่
- NWT Master เป็น Source List ของหน่วยงานรับผิดชอบ
- Key Milestone Master เลือก PIC/NWT ได้หลายรายการ
- เพิ่ม/ลด PIC ได้จาก Edit Key Milestone
- Detail Plan ดึง PIC/NWT จาก Key Milestone Master อัตโนมัติ
- ชื่อ Responsible Person ยังคงเป็น Free form แยกตาม Activity และตาม PIC Unit
- Rename NWT จะอัปเดต Key Milestone และ Activity ที่อ้างอิงทั้งหมด
- Delete NWT จะถูก Block หากยังถูกกำหนดใน Key Milestone
