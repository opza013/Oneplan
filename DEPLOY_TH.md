# วิธีติดตั้งแบบตัดปัญหา Path

1. ลบไฟล์ใน GitHub Repository เดิมทั้งหมด
2. แตก ZIP นี้
3. อัปโหลดไฟล์ทุกไฟล์ไปที่หน้าแรกของ Repository โดยตรง
4. หน้า GitHub ต้องเห็น `index.html`, `server.js`, `package.json`, `render.yaml` ทันที
5. ใน Render ให้สร้าง **New > Web Service** ไม่ใช่ Static Site
6. ตั้งค่า:
   - Runtime: Node
   - Build Command: `npm install --omit=dev`
   - Start Command: `npm start`
   - Health Check Path: `/api/health`
7. Deploy แล้วเปิด `https://<service>.onrender.com/api/health`
8. ต้องเห็น `"version":"5.0.0-direct-root"`
9. จากนั้นจึงเปิด URL หลัก

ถ้า `/api/health` ไม่แสดง JSON ให้เปิดหน้า Logs ของ Render และดูบรรทัดแรกที่มีคำว่า `FATAL`, `npm ERR!` หรือ `Missing`.
