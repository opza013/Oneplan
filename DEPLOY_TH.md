# วิธี Deploy ONE PLAN v5.4.1 บน Render

1. ลบไฟล์เวอร์ชันเก่าใน GitHub Repository แต่ไม่ต้องลบ Repository
2. อัปโหลดไฟล์ทั้งหมดจาก ZIP นี้ไว้ที่ Repository Root
3. ตรวจว่ามี `index.html`, `server.js`, `package.json`, `render.yaml` ที่หน้าแรก
4. Render → Manual Deploy → Clear build cache & deploy
5. เปิด `/api/health` และตรวจ Version เป็น `5.4.1-enterprise-fixes`
6. เปิดหน้า App แล้วกด Ctrl + Shift + R
