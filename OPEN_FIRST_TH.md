# OnePlan — Open First Package

แพ็กเกจนี้ตั้งค่า Render เป็น Free Web Service และไม่มี Persistent Disk เพื่อให้ตรวจสอบว่า App เปิดได้ก่อน

## Deploy
1. อัปโหลดไฟล์ทั้งหมดไว้ที่ GitHub repository root
2. Render: New > Blueprint
3. เลือก repository และ Apply
4. ตรวจ `/api/health` ให้ได้ `{"ok":true,...}`
5. เปิด URL หลักของ Service

## ข้อจำกัด
ข้อมูล Cloud JSON ในแพ็กเกจนี้อยู่ใน `/tmp` และอาจหายเมื่อ Service restart หรือ deploy ใหม่
หลังยืนยันว่า App เปิดได้ ให้เปลี่ยนไปใช้ Starter Web Service + Persistent Disk หรือฐานข้อมูลถาวร
