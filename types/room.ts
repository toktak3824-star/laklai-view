export interface RoomDatePricing {
  startDate: string;
  endDate: string;
  price: number;
  label?: string;
}

export interface RoomPricing {
  weekday: number;

  holiday: number;

  originalWeekday?: number;

  originalHoliday?: number;

  discountLabel?: string;

  datePricing?: RoomDatePricing[];
}

export interface Room {
  id: string;

  title: string;

  subtitle?: string;

  description: string;

  cover: string;

  images: string[];

  pricing: RoomPricing;

  defaultGuests: number;

  maxGuests: number;

  extraAdultPrice: number;

  extraChildBedPrice: number;

  extraBed: string;

  freeChildAge: number;
}