import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "French Aloud",
  description: "Listen to French phrases with natural-sounding voices.",
};

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
};

export default RootLayout;
