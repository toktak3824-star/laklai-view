export interface PriceBreakdownItem {
  date: string;
  type: "weekday" | "holiday";
  price: number;
}

export interface BookingResult {
  nights: number;

  weekdayNights: number;
  holidayNights: number;

  roomTotal: number;

  extraAdultTotal: number;

  extraChildBedTotal: number;

  extraChildTotal: number;

  grandTotal: number;

  effectiveAdults: number;

  freeChildren: number;

  paidChildren: number;

  adultChildren: number;

  extraBedRequired: boolean;

  breakdown: PriceBreakdownItem[];
}

export interface BookingRequest {
  roomId: string;

  checkIn: Date;

  checkOut: Date;

  adults: number;

  children: number;

  childAges: number[];
}