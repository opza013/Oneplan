# วิธี Deploy ONE PLAN v5.4.4 บน Render

1. สำรอง `oneplan-state.json` หรือ Export JSON ก่อน Deploy หากมีข้อมูลใช้งานจริง
2. แตก ZIP และอัปโหลดไฟล์ทั้งหมดไว้ที่ GitHub Repository Root โดยตรง
3. Commit การเปลี่ยนแปลง
4. Render → Manual Deploy → Clear build cache & deploy
5. เปิด `/api/health` และตรวจ Version เป็น `5.4.4-task-subtask-milestone`
6. เปิดหน้า App แล้วกด `Ctrl + Shift + R` หนึ่งครั้ง

## ไม่ต้อง Reset Data
ข้อมูลจาก v5.4.3 จะถูก migrate อัตโนมัติ โดย Activity เดิมจะได้รับ Activity ID และค่าเริ่มต้นของ Task / Sub Task โดยไม่ลบ Next Steps เดิม

## ฟังก์ชันใหม่
- Master Data: กำหนดสี Gantt ของ Key Milestone ด้วย Color Picker / HEX
- Project: โครงสร้าง Task → Sub Task / Phase → Key Milestone
- สามารถใช้ Key Milestone code เดิมซ้ำหลายครั้งใน Project เดียวได้
- Duplicate Activity เพื่อสร้าง Phase 1 / Phase 2 / Phase 3 ได้รวดเร็ว
- Gantt รองรับ Activity ที่ซ้อนช่วงเวลากันและจัด Stack อัตโนมัติ
- Detail Gantt แสดง Task / Sub Task / Key Milestone และ Next Steps ราย Activity
