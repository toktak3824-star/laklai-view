# Laklai View — Admin Environment Variables

ระบบหลังบ้านใช้บัญชีผู้ดูแล 1 บัญชี โดยไม่เก็บ Username/Password ไว้ในโค้ด

เพิ่มค่าต่อไปนี้ใน Environment Variables ของเครื่องที่รันเว็บ และบน Hosting (เช่น Vercel):

```env
ADMIN_USERNAME=ตั้ง_username_ของคุณ
ADMIN_PASSWORD=ตั้ง_password_ที่แข็งแรง
ADMIN_SESSION_SECRET=สร้างข้อความสุ่มยาวอย่างน้อย_32_ตัวอักษร
```

`ADMIN_SESSION_SECRET` ใช้สำหรับเซ็น Session Cookie ห้ามเปิดเผยให้ลูกค้าหรือใส่ไว้ในโค้ดหน้าเว็บ

ระบบเดิมยังต้องมี Environment Variables ของ Supabase และ Resend ที่โปรเจกต์ใช้อยู่ เช่น:

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
RESEND_API_KEY=...
```

## การทำงาน

- `/admin/*` ต้องผ่าน Admin Session ก่อน
- `/admin/login` เป็นหน้าสำหรับเข้าสู่ระบบ
- API สำหรับดู/แก้ไขข้อมูลหลังบ้านจะตรวจ Admin Session อีกชั้น
- Session Cookie เป็น HttpOnly และมีอายุ 7 วัน
- การอัปโหลดสลิปของลูกค้ายังคงเป็น Public API ตาม flow การชำระเงิน
- การเปิดดูสลิปจาก Admin ถูกล็อกให้เฉพาะผู้ดูแล

ก่อนเปิดเว็บจริง ให้ทดสอบ:

1. เปิด `/admin/dashboard` โดยยังไม่ Login → ต้องถูกส่งไป `/admin/login`
2. Login ด้วยบัญชีที่ตั้งไว้ → เข้า Dashboard ได้
3. Logout → เข้า Dashboard ไม่ได้
4. เปิด `/api/admin/bookings` โดยไม่ Login → ต้องได้ HTTP 401
5. เปิด `/api/coffee-orders` โดยไม่ Login → ต้องได้ HTTP 401
6. เปิด `/api/coffee-orders/slip?...` โดยไม่ Login → ต้องได้ HTTP 401
