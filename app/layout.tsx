import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://laklaiview.com"),

  title: {
    default: "หลักลาย View | ที่พักปัว น่าน วิวภูเขา ท่ามกลางธรรมชาติ",
    template: "%s | หลักลาย View",
  },

  description:
    "หลักลาย View ที่พักปัว น่าน ท่ามกลางธรรมชาติและวิวภูเขา ใกล้ถนนเลข 3 เพียง 4.5 กม. บ้านพักส่วนตัว เงียบสงบ พร้อมอ่างแช่น้ำแร่จากธรรมชาติ และ Coffee Shop",

  keywords: [
    "ที่พักปัว",
    "ที่พักปัว น่าน",
    "ที่พักน่าน",
    "ที่พักวิวภูเขา น่าน",
    "ที่พักธรรมชาติ น่าน",
    "ที่พักใกล้ถนนเลข 3",
    "ที่พักบ่อเกลือ",
    "บ้านพักปัว",
    "บ้านพักวิวภูเขา",
    "ที่พักสำหรับคู่รัก น่าน",
    "ที่พักส่วนตัว น่าน",
    "หลักลาย View",
    "Laklai View",
  ],

  alternates: {
    canonical: "https://laklaiview.com",
  },

  openGraph: {
    title: "หลักลาย View | ที่พักปัว น่าน วิวภูเขา ท่ามกลางธรรมชาติ",
    description:
      "พักผ่อนท่ามกลางขุนเขาและธรรมชาติที่ปัว น่าน บ้านพักส่วนตัว เงียบสงบ ใกล้ถนนเลข 3 เพียง 4.5 กม. พร้อมอ่างแช่น้ำแร่จากธรรมชาติ",
    url: "https://laklaiview.com",
    siteName: "หลักลาย View",
    locale: "th_TH",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "หลักลาย View | ที่พักปัว น่าน",
    description:
      "บ้านพักท่ามกลางธรรมชาติและวิวภูเขาในปัว น่าน",
  },

  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="th"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-stone-950 text-white">
        <Navbar />

        {children}
      </body>
    </html>
  );
}