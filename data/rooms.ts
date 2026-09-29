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
      weekday: 1849,
      originalWeekday: 2390,
      holiday: 2099,
      originalHoliday: 2690,
      discountLabel: "ประหยัด 400 บาท",

      // โปรโมชั่นเฉพาะเดือนกันยายน 2026
      promoPrice: 1699,
      promoOriginalPrice: 1990,
      promoLabel: "โปรโมชั่นพิเศษเดือนกันยายน",
      promoBenefit: "เก็บเงาะทานฟรีได้เลย",
      promoStartDate: "2026-09-01",
      promoEndDate: "2026-09-30",

      // ราคาพิเศษเดือนตุลาคม 2569
      datePricing: [
        {
          startDate: "2026-10-09",
          endDate: "2026-10-13",
          price: 1949,
          label: "ราคาพิเศษ 9–13 ตุลาคม 2569",
        },
        {
          startDate: "2026-10-21",
          endDate: "2026-10-23",
          price: 1949,
          label: "ราคาพิเศษ 21–23 ตุลาคม 2569",
        },

        // ราคาพิเศษเดือนธันวาคม 2569
        {
          startDate: "2026-12-04",
          endDate: "2026-12-04",
          price: 1949,
          label: "ราคาพิเศษ 4 ธันวาคม 2569",
        },
        {
          startDate: "2026-12-08",
          endDate: "2026-12-09",
          price: 1949,
          label: "ราคาพิเศษ 8–9 ธันวาคม 2569",
        },
        {
          startDate: "2026-12-11",
          endDate: "2026-12-11",
          price: 1949,
          label: "ราคาพิเศษ 11 ธันวาคม 2569",
        },
        {
  startDate: "2026-12-28",
  endDate: "2027-01-02",
  price: 2299,
  label: "ราคาพิเศษ 28 ธันวาคม 2569 – 2 มกราคม 2570",
},
      ],
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
      weekday: 1849,
      originalWeekday: 2390,
      holiday: 2099,
      originalHoliday: 2690,
      discountLabel: "ประหยัด 400 บาท",

      // โปรโมชั่นเฉพาะเดือนกันยายน 2026
      promoPrice: 1699,
      promoOriginalPrice: 1990,
      promoLabel: "โปรโมชั่นพิเศษเดือนกันยายน",
      promoBenefit: "เก็บเงาะทานฟรีได้เลย",
      promoStartDate: "2026-09-01",
      promoEndDate: "2026-09-30",

      // ราคาพิเศษเดือนตุลาคม 2569
      datePricing: [
        {
          startDate: "2026-10-09",
          endDate: "2026-10-13",
          price: 1949,
          label: "ราคาพิเศษ 9–13 ตุลาคม 2569",
        },
        {
          startDate: "2026-10-21",
          endDate: "2026-10-23",
          price: 1949,
          label: "ราคาพิเศษ 21–23 ตุลาคม 2569",
        },

        // ราคาพิเศษเดือนธันวาคม 2569
        {
          startDate: "2026-12-04",
          endDate: "2026-12-04",
          price: 1949,
          label: "ราคาพิเศษ 4 ธันวาคม 2569",
        },
        {
          startDate: "2026-12-08",
          endDate: "2026-12-09",
          price: 1949,
          label: "ราคาพิเศษ 8–9 ธันวาคม 2569",
        },
        {
          startDate: "2026-12-11",
          endDate: "2026-12-11",
          price: 1949,
          label: "ราคาพิเศษ 11 ธันวาคม 2569",
        },
        {
  startDate: "2026-12-28",
  endDate: "2027-01-02",
  price: 2299,
  label: "ราคาพิเศษ 28 ธันวาคม 2569 – 2 มกราคม 2570",
},
      ],
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
      weekday: 1899,
      originalWeekday: 2500,
      holiday: 2149,
      originalHoliday: 2790,
      discountLabel: "ประหยัด 400 บาท",

      // โปรโมชั่นเฉพาะเดือนกันยายน 2026
      promoPrice: 1699,
      promoOriginalPrice: 1990,
      promoLabel: "โปรโมชั่นพิเศษเดือนกันยายน",
      promoBenefit: "เก็บเงาะทานฟรีได้เลย",
      promoStartDate: "2026-09-01",
      promoEndDate: "2026-09-30",

      // ราคาพิเศษเดือนตุลาคม 2569
      datePricing: [
        {
          startDate: "2026-10-09",
          endDate: "2026-10-13",
          price: 1990,
          label: "ราคาพิเศษ 9–13 ตุลาคม 2569",
        },
        {
          startDate: "2026-10-20",
          endDate: "2026-10-23",
          price: 1990,
          label: "ราคาพิเศษ 20–23 ตุลาคม 2569",
        },

        // ราคาพิเศษเดือนธันวาคม 2569
        {
          startDate: "2026-12-04",
          endDate: "2026-12-04",
          price: 1990,
          label: "ราคาพิเศษ 4 ธันวาคม 2569",
        },
        {
          startDate: "2026-12-08",
          endDate: "2026-12-09",
          price: 1990,
          label: "ราคาพิเศษ 8–9 ธันวาคม 2569",
        },
        {
          startDate: "2026-12-11",
          endDate: "2026-12-11",
          price: 1990,
          label: "ราคาพิเศษ 11 ธันวาคม 2569",
        },
        {
  startDate: "2026-12-28",
  endDate: "2027-01-02",
  price: 2349,
  label: "ราคาพิเศษ 28 ธันวาคม 2569 – 2 มกราคม 2570",
},
      ],
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

    images: Array.from({ length: 19 }, (_, i) => {
      const number = String(i + 1).padStart(2, "0");
      return `/images/house4/${number}.jpg`;
    }),

    videos: [],

    pricing: {
      weekday: 1614,
      originalWeekday: 2100,
      holiday: 1869,
      originalHoliday: 2290,
      discountLabel: "ประหยัด 400 บาท",

      // โปรโมชั่นเฉพาะเดือนกันยายน 2026
      promoPrice: 1699,
      promoOriginalPrice: 1990,
      promoLabel: "โปรโมชั่นพิเศษเดือนกันยายน",
      promoBenefit: "เก็บเงาะทานฟรีได้เลย",
      promoStartDate: "2026-09-01",
      promoEndDate: "2026-09-30",

      // ราคาพิเศษเดือนตุลาคม 2569
      datePricing: [
        {
          startDate: "2026-10-09",
          endDate: "2026-10-13",
          price: 1759,
          label: "ราคาพิเศษ 9–13 ตุลาคม 2569",
        },
        {
          startDate: "2026-10-21",
          endDate: "2026-10-23",
          price: 1759,
          label: "ราคาพิเศษ 21–23 ตุลาคม 2569",
        },

        // ราคาพิเศษเดือนธันวาคม 2569
        {
          startDate: "2026-12-04",
          endDate: "2026-12-04",
          price: 1790,
          label: "ราคาพิเศษ 4 ธันวาคม 2569",
        },
        {
          startDate: "2026-12-08",
          endDate: "2026-12-09",
          price: 1790,
          label: "ราคาพิเศษ 8–9 ธันวาคม 2569",
        },
        {
          startDate: "2026-12-11",
          endDate: "2026-12-11",
          price: 1790,
          label: "ราคาพิเศษ 11 ธันวาคม 2569",
        },
        {
  startDate: "2026-12-28",
  endDate: "2027-01-02",
  price: 1900,
  label: "ราคาพิเศษ 28 ธันวาคม 2569 – 2 มกราคม 2570",
},
      ],
    },

    defaultGuests: 2,
    maxGuests: 4,
    extraAdultPrice: 500,
    extraChildBedPrice: 350,
    extraBed: "โซฟาเบด 6 ฟุต",
    freeChildAge: 8,
  },
];