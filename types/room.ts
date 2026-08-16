export interface RoomPricing {
  weekday: number;
  holiday: number;
  originalWeekday?: number;
  originalHoliday?: number;
  discountLabel?: string;
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