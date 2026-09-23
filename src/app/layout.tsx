import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Manrope, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-disp",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "𝚂𝚊𝚖𝚞𝚎𝚕~ — Vebhav | Portfolio",
  description:
    "Building with code, lost in cinema, creating digitally, gaming & expressing through words.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${manrope.variable} ${jetbrainsMono.variable}`}>
      <body className="bg-[#080808] text-[#f2f0eb] antialiased">{children}</body>
    </html>
  );
}
