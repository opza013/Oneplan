# วิธี Deploy OnePlan v5.2 และเลือก Storage Path

1. อัปโหลดไฟล์ทั้งหมดใน ZIP ไปที่ GitHub Repository Root โดยตรง
2. ใน Render ใช้ **Web Service / Node** ไม่ใช่ Static Site
3. ตั้งค่า Build Command: `npm install --omit=dev`
4. ตั้งค่า Start Command: `npm start`
5. ตั้งค่า Health Check Path: `/api/health`
6. หลัง Deploy เปิด `/api/health` ต้องเห็น `5.2.0-storage-path`

## การเลือก Path ใน App

ไปที่ **Settings > Server Storage Path**

- **Temporary server storage**: เปิดใช้ได้ทันที แต่ข้อมูลอาจหายเมื่อ Restart/Deploy
- **Application data folder**: เก็บในโฟลเดอร์ `data` ของ App แต่บน Render โดยทั่วไปยังไม่ถาวร
- **Render persistent disk**: ใช้ `/var/data` และต้อง Attach Disk ที่ Render ก่อน
- **Custom directory**: ระบุ Directory ฝั่ง Server ที่มีสิทธิ์เขียน

เปิดตัวเลือก **Copy the current cloud data...** เพื่อย้ายข้อมูลปัจจุบันไป Path ใหม่ ระบบจะทดสอบสิทธิ์เขียนก่อนเปลี่ยนจริง หากปลายทางมีข้อมูลอยู่แล้ว ระบบจะขอ Confirm ก่อนเขียนทับ

หมายเหตุ: Path นี้เป็น Path บน Server ไม่ใช่โฟลเดอร์ในเครื่อง Windows/iPad ของผู้ใช้
