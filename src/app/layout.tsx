import type { Metadata } from "next";
import { Bricolage_Grotesque, Instrument_Sans, Fraunces } from "next/font/google";
import "./globals.css";

const display = Bricolage_Grotesque({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const sans = Instrument_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
});

const serif = Fraunces({
  variable: "--font-serif",
  subsets: ["latin"],
  style: ["italic", "normal"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "H2O Church — A Campus Church at Ohio State",
  description:
    "H2O is a local church committed to cultivating a Christlike community at Ohio State to grow His kingdom wherever we go. Columbus, OH.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${sans.variable} ${serif.variable} antialiased`}
    >
      <body>{children}</body>
    </html>
  );
}
