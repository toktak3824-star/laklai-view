export type DinnerMenuItem = {
  id: string;
  name: string;
  price: number;
  category: string;
};

export const DINNER_MENU: DinnerMenuItem[] = [
  { id: "moo-kra-ta", name: "หมูกระทะ 1 ชุด (2 ท่านอิ่ม)", price: 450, category: "ชุดอาหาร" },
  { id: "khan-toke", name: "ชุดขันโตก (อาหาร 4 + ข้าว 1 โถ 2-3 ท่านอิ่ม)", price: 389, category: "ชุดอาหาร" },

  { id: "kaprao-moo-sub", name: "ผัดกะเพราหมูสับ (กับข้าว)", price: 99, category: "กับข้าว" },
  { id: "kai-tod-mak-wen", name: "ไก่ทอดมะแข่วน", price: 99, category: "กับข้าว" },
  { id: "pad-nor-dong", name: "ผัดหน่อไม้ดอง", price: 89, category: "กับข้าว" },
  { id: "nam-prik-moo-kua", name: "ชุดน้ำพริกหมูคั่ว (แห้งไม่มีน้ำ) + ผักลวก", price: 100, category: "กับข้าว" },
  { id: "pad-pak-good", name: "ผัดผักกูด", price: 89, category: "กับข้าว" },
  { id: "yam-pak-good", name: "ยำผักกูด (เมนูซิกเนเจอร์)", price: 129, category: "เมนูซิกเนเจอร์" },
  { id: "kai-jiew-moo-sub", name: "ไข่เจียวหมูสับ", price: 69, category: "กับข้าว" },
  { id: "tom-som-kai", name: "ต้มส้มไก่", price: 129, category: "กับข้าว" },
  { id: "chicken-skin", name: "หนังไก่ทอด", price: 89, category: "กับข้าว" },
  { id: "som-tam", name: "ส้มตำ (ไทย/ปูปลาร้า)", price: 79, category: "กับข้าว" },
  { id: "yam-woon-sen-moo-yor", name: "ยำวุ้นเส้นหมูยอ", price: 129, category: "กับข้าว" },
  { id: "yam-moo-yor", name: "ยำหมูยอ", price: 120, category: "กับข้าว" },

  { id: "rice-pot-small", name: "ข้าวโถเล็ก", price: 79, category: "ข้าว" },
  { id: "rice-pot-large", name: "ข้าวโถใหญ่", price: 89, category: "ข้าว" },
  { id: "plain-rice-plate", name: "ข้าวเปล่าจาน", price: 30, category: "ข้าว" },

  { id: "kaprao-rice", name: "ข้าวกะเพราหมูสับ", price: 89, category: "อาหารจานเดียว" },
  { id: "fried-rice-small", name: "ข้าวผัดหมู จานเล็ก", price: 79, category: "อาหารจานเดียว" },
  { id: "fried-rice-large", name: "ข้าวผัดหมู จานใหญ่", price: 99, category: "อาหารจานเดียว" },
  { id: "pak-good-rice", name: "ผัดผักกูดราดข้าว", price: 89, category: "อาหารจานเดียว" },
  { id: "bamboo-shoot-rice", name: "ผัดหน่อไม้ดองราดข้าว", price: 89, category: "อาหารจานเดียว" },
  { id: "omelet-rice", name: "ข้าวไข่เจียวหมูสับ", price: 79, category: "อาหารจานเดียว" },
  { id: "fried-egg", name: "ไข่ดาว", price: 15, category: "อาหารจานเดียว" },
];
