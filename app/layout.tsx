import { Baskervville } from "next/font/google";
import type { Metadata } from "next";
import "./globals.css";

const headingFont = Baskervville({
  subsets: ["latin"],
  weight: "600",
  style: "normal",
  display: "swap",
  variable: "--font-baskervville",
});

export const metadata: Metadata = {
  title: "French Aloud",
  description: "Listen to French phrases with natural-sounding voices.",
};

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="en" className={headingFont.variable}>
      <body>{children}</body>
    </html>
  );
};

export default RootLayout;
