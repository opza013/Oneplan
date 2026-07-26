# วิธีใช้งาน Storage จาก Folder ในเครื่อง

1. Deploy ไฟล์ทั้งหมดขึ้น Render Web Service ตามเดิม
2. เปิด OnePlan ผ่าน Microsoft Edge หรือ Google Chrome บน Windows
3. เข้า Settings > Device Folder Storage
4. กด Choose Folder แล้วเลือกโฟลเดอร์จากเครื่อง เช่น Documents\OnePlan Data หรือโฟลเดอร์ OneDrive
5. อนุญาต Read/Write
6. ระบบจะสร้าง `oneplan-state.json` และโฟลเดอร์ `backups`

หมายเหตุ: Browser จะไม่ส่ง Full Windows Path ให้ Web App แต่จะจำสิทธิ์ของ Folder ผ่าน Browser profile. หากสิทธิ์หมด ให้กด Reconnect Folder.
