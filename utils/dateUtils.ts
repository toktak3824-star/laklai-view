import { holidays } from "@/data/holidays";

/**
 * แปลงวันที่เป็น YYYY-MM-DD
 */
export function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
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