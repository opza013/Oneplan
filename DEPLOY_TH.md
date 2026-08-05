# วิธี Deploy ONE PLAN v5.4 บน Render

1. ลบไฟล์เวอร์ชันเก่าใน GitHub Repository แล้วอัปโหลดไฟล์ทั้งหมดจาก ZIP นี้ไว้ที่ Repository Root
2. หน้า GitHub ต้องเห็น `index.html`, `server.js`, `package.json`, `render.yaml` โดยตรง
3. ใน Render ให้ใช้ Web Service แบบ Node
4. Build Command: `npm install --omit=dev`
5. Start Command: `npm start`
6. Health Check Path: `/api/health`
7. หลัง Deploy เปิด `/api/health` และตรวจว่า version เป็น `5.4.0-enterprise-interface`
8. เปิดหน้า App แล้วกด `Ctrl + Shift + R` หนึ่งครั้ง

## Device Folder Storage
เปิดผ่าน Microsoft Edge หรือ Google Chrome จากนั้นเข้า Settings > Device Folder Storage > Choose Folder เพื่อเลือกโฟลเดอร์จากเครื่อง ระบบจะสร้าง `oneplan-state.json` และโฟลเดอร์ `backups`

การปรับ v5.4 เป็นการยกระดับ Interface โดยไม่เปลี่ยนโครงสร้างข้อมูลเดิมจาก v5.3
