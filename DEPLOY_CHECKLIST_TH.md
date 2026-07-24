# Checklist ติดตั้ง OnePlan ใหม่ทั้งหมด

## A. GitHub

- สร้าง Repository ใหม่หรือใช้ Repository เดิมที่ล้างไฟล์แล้ว
- Upload **ไฟล์และโฟลเดอร์ภายใน ZIP** ไปที่หน้า Root
- ตรวจว่ามี `render.yaml`, `server.js`, `package.json` อยู่หน้าแรก
- ตรวจว่า App อยู่ที่ `public/index.html`
- ห้ามมีโฟลเดอร์ครอบอีกชั้น เช่น `oneplan-complete-rebuild/public/index.html`
- Commit changes

## B. Render

### กรณี Service เดิมยังเป็น Static Site

ไม่ควรใช้ต่อ เพราะระบบ Storage ใหม่ต้องใช้ Node API ให้สร้าง Service ใหม่ผ่าน Blueprint

### สร้างใหม่

1. New > Blueprint
2. เลือก Repository
3. Apply Blueprint
4. ใส่ค่า `STATE_TOKEN` เมื่อระบบถาม
5. ตรวจ Instance เป็น Starter และมี Disk `/var/data`
6. รอ Deploy สำเร็จ

## C. ตรวจระบบหลัง Deploy

เปิด:

```text
https://<service-name>.onrender.com/api/health
```

ต้องได้ JSON และสถานะ HTTP 200

จากนั้นเปิดหน้า App และตรวจ:

- Sidebar แสดง ONE PLAN / RANGE OPERATION PLATFORM
- Settings มี Cloud State Storage
- Dashboard มี Implementation Load พร้อม Legend ของ 5 ทีม
- Detail Plan เปิด Project Gantt ได้
- คลิก Milestone เปิดแผงรายละเอียดด้านขวา
- Activity Next Steps เพิ่ม แก้ไข บันทึก และลบได้
- Filter รองรับ Search และ Multiple Select

## D. เชื่อม Storage

- Settings > Cloud State Storage
- ใส่ State Token เดียวกับ Render
- Save Token & Connect
- ตรวจ Cloud status เป็น `Cloud synced`

## E. ถ้าหน้ายังเป็นเวอร์ชันเก่า

- Render > Manual Deploy > Clear build cache & deploy
- Windows กด `Ctrl + Shift + R`
- ตรวจ Source ว่า `public/index.html` ถูกอัปเดต ไม่ใช่ `index.html` ที่ Root

## F. สำรองข้อมูล

ก่อนการ Pull/Force Save ครั้งแรก:

- Download Local Backup
- Download Cloud Backup เมื่อ Cloud มีข้อมูลแล้ว
