# วิธี Deploy ONE PLAN v5.4.2 บน Render

1. อัปโหลดไฟล์ทั้งหมดจาก ZIP นี้ไว้ที่ GitHub Repository Root
2. ตรวจว่ามี `index.html`, `server.js`, `package.json` และ `render.yaml` อยู่หน้าแรก
3. Render → Manual Deploy → Clear build cache & deploy
4. เปิด `/api/health` และตรวจ Version เป็น `5.4.2-equal-height-workload`
5. เปิดหน้า App แล้วกด `Ctrl + Shift + R`

## จุดตรวจหลังอัปเดต

- Card ใน Dashboard แถวเดียวกันต้องสูงเท่ากัน
- Workload → Current ต้องแสดง 7 แท่ง: สัปดาห์ปัจจุบัน + 6 สัปดาห์ถัดไป
