export const rooms = [
  {
    id: "house1",
    title: "บ้านสวนวิถี",
    subtitle: "Countryside Lifestyle Home",
    description:
      "บ้านพักท่ามกลางธรรมชาติ พร้อมวิวภูเขาและสระน้ำแร่ธรรมชาติไว้แช่ส่วนตัว",
    cover: "/images/house1/01.jpg",

    images: Array.from({ length: 19 }, (_, i) => {
      const number = String(i + 1).padStart(2, "0");
      return `/images/house1/${number}.jpg`;
    }),

    videos: [
      "/images/house1/20.mp4",
      "/images/house1/21.mp4",
    ],

    pricing: {
      weekday: 1990,
      originalWeekday: 2390,
      holiday: 2290,
      originalHoliday: 2690,
      discountLabel: "ประหยัด 400 บาท",
    },

    defaultGuests: 2,
    maxGuests: 3,
    extraAdultPrice: 500,
    extraChildBedPrice: 350,
    extraBed: "ที่นอน 3 ฟุต",
    freeChildAge: 8,
  },

  {
    id: "house2",
    title: "บ้านพักใจ",
    subtitle: "Mind Retreat",
    description:
      "บ้านพักสำหรับการพักผ่อนอย่างแท้จริง เงียบสงบ เป็นส่วนตัว พร้อมวิวภูเขาและสระน้ำแร่ธรรมชาติ",
    cover: "/images/house2/01.jpg",

    images: Array.from({ length: 19 }, (_, i) => {
      const number = String(i + 1).padStart(2, "0");
      return `/images/house2/${number}.jpg`;
    }),

    videos: [
      "/images/house2/20.mp4",
    ],

    pricing: {
      weekday: 1990,
      originalWeekday: 2390,
      holiday: 2290,
      originalHoliday: 2690,
      discountLabel: "ประหยัด 400 บาท",
    },

    defaultGuests: 2,
    maxGuests: 3,
    extraAdultPrice: 500,
    extraChildBedPrice: 350,
    extraBed: "ที่นอน 3 ฟุต",
    freeChildAge: 8,
  },

  {
    id: "house3",
    title: "บ้านอุ่นใจ",
    subtitle: "Cozy Escape",
    description:
      "บ้านพักวิวภูเขา พร้อมสระน้ำแร่ธรรมชาติ และมุมพักผ่อนส่วนตัว",
    cover: "/images/house3/01.jpg",

    images: Array.from({ length: 18 }, (_, i) => {
      const number = String(i + 1).padStart(2, "0");
      return `/images/house3/${number}.jpg`;
    }),

    videos: [
      "/images/house3/19.mp4",
      "/images/house3/20.mp4",
      "/images/house3/21.mp4",
    ],

    pricing: {
      weekday: 2090,
      originalWeekday: 2500,
      holiday: 2390,
      originalHoliday: 2790,
      discountLabel: "ประหยัด 400 บาท",
    },

    defaultGuests: 2,
    maxGuests: 3,
    extraAdultPrice: 500,
    extraChildBedPrice: 350,
    extraBed: "ที่นอน 3 ฟุต",
    freeChildAge: 8,
  },

  {
    id: "house4",
    title: "บ้านสุขใจ",
    subtitle: "My Haven",
    description:
      "บ้านพักที่อบอุ่น เหมาะสำหรับคู่รักและครอบครัว เงียบสงบและเป็นส่วนตัว",
    cover: "/images/house4/01.jpg",

    images: Array.from({ length: 19}, (_, i) => {
      const number = String(i + 1).padStart(2, "0");
      return `/images/house4/${number}.jpg`;
    }),

    videos: [],

    pricing: {
      weekday: 1699,
      originalWeekday: 2100,
      holiday: 1890,
      originalHoliday: 2290,
      discountLabel: "ประหยัด 400 บาท",
    },

    defaultGuests: 2,
    maxGuests: 4,
    extraAdultPrice: 500,
    extraChildBedPrice: 350,
    extraBed: "โซฟาเบด 6 ฟุต",
    freeChildAge: 8,
  },
];