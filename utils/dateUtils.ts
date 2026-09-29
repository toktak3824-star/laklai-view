import { holidays } from "@/data/holidays";

/**
 * แปลงวันที่เป็น YYYY-MM-DD
 *
 * ใช้เวลาท้องถิ่น (Local Time)
 * ไม่ใช้ toISOString()
 *
 * เหตุผล:
 * ระบบจองใช้วันที่ตามปฏิทินประเทศไทย
 * หากใช้ toISOString() วันที่เวลา 00:00
 * ในประเทศไทย (UTC+7) จะถูกเลื่อนกลับไปเป็นวันก่อนหน้า
 *
 * ตัวอย่าง:
 * 26/10/2026 เวลาไทย
 * จะต้องได้ 2026-10-26
 *
 * ไม่ใช่ 2026-10-25
 */
export function formatDate(date: Date): string {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

/**
 * ตรวจสอบว่าเป็นวันหยุดหรือไม่
 */
export function isHoliday(date: Date): boolean {
  return holidays.includes(formatDate(date));
}

/**
 * คืนรายการวันที่ทั้งหมดของการเข้าพัก
 * (ไม่นับวัน Check-out)
 */
export function getStayDates(
  checkIn: Date,
  checkOut: Date
): Date[] {
  const dates: Date[] = [];

  const current = new Date(checkIn);

  while (current < checkOut) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  return dates;
}