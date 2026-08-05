# วิธี Deploy ONE PLAN v5.4.3 บน Render

1. แตก ZIP และอัปโหลดไฟล์ทั้งหมดไว้ที่ GitHub Repository Root
2. Commit การเปลี่ยนแปลง
3. Render → Manual Deploy → Clear build cache & deploy
4. เปิด `/api/health` และตรวจ Version เป็น `5.4.3-row-level-alignment`
5. เปิดหน้า App แล้วกด `Ctrl + Shift + R` หนึ่งครั้ง

## จุดที่แก้
- Card ในแถวเดียวกันเริ่มและจบที่ระดับเดียวกัน
- ยกเลิก margin ระหว่าง card ที่เคยดันกล่องลำดับถัดไปลง 14 px
- Workload Current แสดง Current Week + Next 6 Weeks รวม 7 สัปดาห์
