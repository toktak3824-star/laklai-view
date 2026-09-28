-- เพิ่มช่องสำหรับบันทึกรายการอาหารเย็นสั่งล่วงหน้า
-- ใน Supabase > SQL Editor ให้รันชุดนี้ 1 ครั้ง

alter table public.bookings
  add column if not exists dinner_items jsonb not null default '[]'::jsonb;

alter table public.bookings
  add column if not exists dinner_total numeric(10,2) not null default 0;

alter table public.bookings
  drop constraint if exists bookings_dinner_total_nonnegative;

alter table public.bookings
  add constraint bookings_dinner_total_nonnegative
  check (dinner_total >= 0);
