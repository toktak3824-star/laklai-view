ไฟล์ Phase 2: ระบบออกใบเสร็จ PDF และส่งอีเมล

1) นำ app/api/admin/confirm/route.ts ไปแทนที่ไฟล์เดิมในโปรเจกต์
   app/api/admin/confirm/route.ts

2) นำไฟล์ 202611120002_receipt_email_status.sql ไปไว้ใน
   supabase/migrations/202611120002_receipt_email_status.sql
   (ใช้ร่วมกับ 202611120001_booking_receipts.sql ที่ส่งไปก่อนหน้า)

3) คัดลอกโฟลเดอร์ public/fonts ทั้งโฟลเดอร์ไปไว้ที่ public/fonts ในโปรเจกต์
   ต้องมี NotoSansThai-Regular.ttf และ NotoSansThai-Bold.ttf

4) ที่ Terminal ในโฟลเดอร์โปรเจกต์ รัน:
   npm install pdfkit
   npm install -D @types/pdfkit

5) อย่าเพิ่งรัน build หรือ deploy จนกว่าจะรัน SQL migrations ทั้งสองไฟล์
   และตรวจสอบไฟล์ route กับ schema ที่ Supabase ก่อน

หมายเหตุ:
- Route นี้คง RPC confirm_booking_payment เดิมไว้
- ออกใบเสร็จหนึ่งฉบับต่อหนึ่ง payment record
- PDF แสดงยอดรับเงินครั้งนี้ ยอดรับสะสม และยอดคงเหลือ
- PDF เก็บใน private bucket booking-receipts
- Email แนบ PDF และบันทึกสถานะส่งเพื่อกันการส่งซ้ำ
- ยังต้องเพิ่มปุ่มดู/ดาวน์โหลดใบเสร็จในหน้า BookingTable เป็นขั้นถัดไป
