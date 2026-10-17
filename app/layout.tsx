import { Plus_Jakarta_Sans } from "next/font/google";
import type { Metadata } from "next";
import "./globals.css";

const headingFont = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: "700",
  style: "italic",
  display: "swap",
  variable: "--font-plus-jakarta-sans",
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
