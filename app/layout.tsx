// app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Haki Tools – More booked jobs from smarter websites & AI",
  description:
    "Haki Tools helps busy local businesses get more booked jobs with smarter websites, funnels, and AI-powered workflows.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} bg-background text-foreground antialiased`}
      >
        <div className="min-h-screen bg-background">
          {children}
        </div>
      </body>
    </html>
  );
}
