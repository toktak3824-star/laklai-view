import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import "./globals.css";

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
    default: "หลักลาย view วิถีบ้านป่า | ที่พักท่ามกลางธรรมชาติ จังหวัดน่าน",
    template: "%s | หลักลาย view วิถีบ้านป่า",
  },

  description:
    "หลักลาย view วิถีบ้านป่า บ้านพักส่วนตัวท่ามกลางธรรมชาติและวิวภูเขา จังหวัดน่าน บนเส้นทางปัว-บ่อเกลือ พร้อมอ่างแช่น้ำแร่จากธรรมชาติ กิจกรรมวิถีบ้านป่า และอาหารพื้นถิ่น",

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
    "กิจกรรมวิถีบ้านป่า",
    "เที่ยวธรรมชาติ น่าน",
    "อาหารพื้นถิ่นน่าน",
    "หลักลาย view วิถีบ้านป่า",
    "Laklai View",
  ],

  alternates: {
    canonical: "https://laklaiview.com",
  },

  openGraph: {
    title: "หลักลาย view วิถีบ้านป่า",
    description:
      "พักผ่อนท่ามกลางขุนเขาและธรรมชาติ สัมผัสวิถีบ้านป่า บ้านพักส่วนตัว กิจกรรมธรรมชาติ และอาหารพื้นถิ่น จังหวัดน่าน",
    url: "https://laklaiview.com",
    siteName: "หลักลาย view วิถีบ้านป่า",
    locale: "th_TH",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "หลักลาย view วิถีบ้านป่า",
    description:
      "บ้านพักส่วนตัว กิจกรรมวิถีบ้านป่า และอาหารพื้นถิ่น ท่ามกลางธรรมชาติและวิวภูเขา จังหวัดน่าน",
  },

  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html
      lang="th"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-stone-950 text-white">
        <Navbar />
        {children}
        <Footer />

        {/* Google Ads / Google Tag */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=AW-18457702129"
          strategy="afterInteractive"
        />

        <Script id="google-ads-tag" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){window.dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'AW-18457702129');
          `}
        </Script>
      </body>
    </html>
  );
}
