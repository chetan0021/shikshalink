import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";

import { Providers } from "@/app/providers";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const display = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Shiksha Link — Connecting Every Child to Their Future",
  description:
    "Shiksha Link is the AI platform that connects teachers, parents, students and administrators — so no child slips through the cracks.",
  metadataBase: new URL("https://shiksha-link.example"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${display.variable}`}>
      <body className="min-h-dvh antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

