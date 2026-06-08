import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LifeLink - AI-Powered Healthcare Coordination",
  description: "A nurturing, trustworthy experience. LifeLink combines AI triage, decentralized medical records, and blockchain-verified consent.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} font-sans h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-brand-heading selection:bg-brand-mint selection:text-white">{children}</body>
    </html>
  );
}
